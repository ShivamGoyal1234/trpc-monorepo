import {
  GetPublicFormSchema,
  GetPublicFormsSchema,
  RecordFormViewSchema,
  SubmitResponseSchema,
} from "@repo/schemas";
import {
  createTRPCRouter,
  publicProcedure,
} from "@repo/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { db, answers, fields, forms, responses, users } from "../lib/db";
import { redis } from "../lib/redis";
import { emailService } from "../services/email.service";
import {
  ensureFormAnalytics,
  flushFormViews,
  incrementResponseStats,
} from "../services/analytics.service";

const VIEWS_PREFIX = "form:views:";

type PublicFormSettings = {
  limitResponses?: boolean;
  maxResponses?: number;
  expiresAt?: string;
  passwordHash?: string;
};

function assertFormAcceptingResponses(
  settings: PublicFormSettings,
  totalResponses: number,
): void {
  if (settings.expiresAt && new Date(settings.expiresAt) <= new Date()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This form is no longer accepting responses.",
    });
  }

  if (
    settings.limitResponses &&
    typeof settings.maxResponses === "number" &&
    totalResponses >= settings.maxResponses
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Response limit reached for this form.",
    });
  }
}

async function assertFormPassword(
  settings: PublicFormSettings,
  password: string | undefined,
): Promise<void> {
  if (!settings.passwordHash) {
    return;
  }

  if (!password) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Password required for this form.",
    });
  }

  const valid = await bcrypt.compare(password, settings.passwordHash);
  if (!valid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid form password.",
    });
  }
}

async function checkSubmitRateLimit(ip: string): Promise<void> {
  const key = `rl:submit:trpc:${ip}`;
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, 60 * 60);
    }
    if (current > 10) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Submission limit reached. Try again later.",
      });
    }
  } catch (err) {
    if (err instanceof TRPCError) {
      throw err;
    }
    // Redis down — allow submission
  }
}

async function checkViewRateLimit(formId: string, ip: string): Promise<void> {
  const key = `rl:formview:trpc:${formId}:${ip}`;
  try {
    const exists = await redis.get(key);
    if (exists) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "View already recorded for this form.",
      });
    }
    await redis.setex(key, 30 * 60, "1");
  } catch (err) {
    if (err instanceof TRPCError) {
      throw err;
    }
    // Redis down — allow view
  }
}

export const publicRouter = createTRPCRouter({
  getForm: publicProcedure
    .input(GetPublicFormSchema)
    .query(async ({ input }) => {
      const form = await db.query.forms.findFirst({
        where: and(
          or(eq(forms.id, input.idOrSlug), eq(forms.slug, input.idOrSlug)),
          eq(forms.status, "published"),
        ),
        with: {
          fields: {
            orderBy: (f, { asc }) => [asc(f.order)],
          },
        },
      });

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }

      const settings = (form.settings ?? {}) as PublicFormSettings;
      const analytics = await ensureFormAnalytics(form.id);
      assertFormAcceptingResponses(settings, analytics.totalResponses);
      await assertFormPassword(settings, input.password);

      const { userId: _userId, ...publicForm } = form;
      return publicForm;
    }),

  submitResponse: publicProcedure
    .input(SubmitResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const ip =
        ctx.req.ip ??
        (ctx.req.headers["x-forwarded-for"] as string | undefined) ??
        "unknown";

      await checkSubmitRateLimit(ip);

      const form = await db.query.forms.findFirst({
        where: and(
          eq(forms.id, input.formId),
          eq(forms.status, "published"),
        ),
      });

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }

      const settings = (form.settings ?? {}) as PublicFormSettings;
      const analytics = await ensureFormAnalytics(input.formId);
      assertFormAcceptingResponses(settings, analytics.totalResponses);
      await assertFormPassword(settings, input.formPassword);

      const formFields = await db.query.fields.findMany({
        where: eq(fields.formId, input.formId),
      });

      const fieldIds = new Set(formFields.map((f) => f.id));
      for (const answer of input.answers) {
        if (!fieldIds.has(answer.fieldId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid field: ${answer.fieldId}`,
          });
        }
      }

      const [response] = await db
        .insert(responses)
        .values({
          formId: input.formId,
          respondentEmail: input.respondentEmail,
          respondentIp: ip,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          status: "complete",
        })
        .returning();

      if (!response) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save response",
        });
      }

      await db.insert(answers).values(
        input.answers.map((a) => ({
          responseId: response.id,
          fieldId: a.fieldId,
          value: a.value,
        })),
      );

      await incrementResponseStats(input.formId);

      const updatedAnalytics = await ensureFormAnalytics(input.formId);
      const creator = await db.query.users.findFirst({
        where: eq(users.id, form.userId),
      });

      if (creator) {
        void emailService.sendFormResponseToCreator(
          creator.email,
          creator.name,
          form.title,
          updatedAnalytics.totalResponses,
          form.id,
        );
      }

      if (input.respondentEmail) {
        const settings = form.settings as { submitMessage?: string };
        void emailService.sendFormResponseToRespondent(
          input.respondentEmail,
          form.title,
          settings.submitMessage ?? "Thank you for your response!",
        );
      }

      return { success: true, responseId: response.id };
    }),

  getPublicForms: publicProcedure
    .input(GetPublicFormsSchema)
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [
        eq(forms.status, "published"),
        eq(forms.visibility, "public"),
      ];

      if (input.search) {
        conditions.push(
          or(
            ilike(forms.title, `%${input.search}%`),
            ilike(forms.description, `%${input.search}%`),
          )!,
        );
      }

      const where = and(...conditions);

      const [items, [totalRow]] = await Promise.all([
        db.query.forms.findMany({
          where,
          columns: {
            id: true,
            title: true,
            description: true,
            slug: true,
            theme: true,
            publishedAt: true,
            createdAt: true,
          },
          orderBy: [desc(forms.publishedAt)],
          limit: input.limit,
          offset,
        }),
        db.select({ total: count() }).from(forms).where(where),
      ]);

      return {
        items,
        total: Number(totalRow?.total ?? 0),
        page: input.page,
        limit: input.limit,
      };
    }),

  recordFormView: publicProcedure
    .input(RecordFormViewSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await db.query.forms.findFirst({
        where: and(
          eq(forms.id, input.formId),
          eq(forms.status, "published"),
        ),
      });

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }

      const ip =
        ctx.req.ip ??
        (ctx.req.headers["x-forwarded-for"] as string | undefined) ??
        "unknown";

      await checkViewRateLimit(input.formId, ip);

      try {
        await redis.incr(`${VIEWS_PREFIX}${input.formId}`);
      } catch {
        await ensureFormAnalytics(input.formId);
        await flushFormViews(input.formId, 1);
      }

      return { success: true };
    }),
});
