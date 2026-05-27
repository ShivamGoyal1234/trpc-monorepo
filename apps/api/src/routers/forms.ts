import {
  CreateFormSchema,
  ExportResponsesSchema,
  FormIdSchema,
  GenerateSlugSchema,
  ListFormsSchema,
  UpdateFormSchema,
  UpdateSlugSchema,
} from "@repo/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@repo/trpc";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { ensureFormAnalytics } from "../services/analytics.service";
import {
  ensureUniqueSlug,
  slugifyTitle,
  verifyFormOwnership,
} from "../lib/forms";
import { db, fields, forms, responses } from "../lib/db";
import { responsesToCsv, responsesToJson } from "../lib/export";

const DEFAULT_THEME = {
  primaryColor: "#0066cc",
  backgroundColor: "#f8fafc",
  textColor: "#1e293b",
  accentColor: "#0052a3",
  cardColor: "#ffffff",
  borderColor: "#e2e8f0",
  fontFamily: "'Inter', sans-serif",
  borderRadius: "8px",
  buttonStyle: "rounded",
};

export const formsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(ListFormsSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(forms.userId, ctx.user.id)];

      if (input.status) {
        conditions.push(eq(forms.status, input.status));
      }
      if (input.visibility) {
        conditions.push(eq(forms.visibility, input.visibility));
      }
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
          orderBy: [desc(forms.updatedAt)],
          limit: input.limit,
          offset,
          with: { analytics: true },
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

  getById: protectedProcedure
    .input(FormIdSchema)
    .query(async ({ ctx, input }) => {
      const form = await verifyFormOwnership(input.id, ctx.user.id);
      const formFields = await db.query.fields.findMany({
        where: eq(fields.formId, input.id),
        orderBy: (f, { asc }) => [asc(f.order)],
      });
      const analytics = await ensureFormAnalytics(input.id);
      return { ...form, fields: formFields, analytics };
    }),

  create: protectedProcedure
    .input(CreateFormSchema)
    .mutation(async ({ ctx, input }) => {
      const [form] = await db
        .insert(forms)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          visibility: input.visibility,
          theme: input.theme ?? DEFAULT_THEME,
        })
        .returning();

      if (!form) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create form",
        });
      }

      await ensureFormAnalytics(form.id);
      return form;
    }),

  update: protectedProcedure
    .input(UpdateFormSchema.extend({ id: FormIdSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.id, ctx.user.id);
      const { id, ...data } = input;

      const [updated] = await db
        .update(forms)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(forms.id, id))
        .returning();

      return updated!;
    }),

  publish: protectedProcedure
    .input(FormIdSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.id, ctx.user.id);

      const [updated] = await db
        .update(forms)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(forms.id, input.id))
        .returning();

      return updated!;
    }),

  unpublish: protectedProcedure
    .input(FormIdSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.id, ctx.user.id);

      const [updated] = await db
        .update(forms)
        .set({
          status: "draft",
          updatedAt: new Date(),
        })
        .where(eq(forms.id, input.id))
        .returning();

      return updated!;
    }),

  archive: protectedProcedure
    .input(FormIdSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.id, ctx.user.id);

      const [updated] = await db
        .update(forms)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(forms.id, input.id))
        .returning();

      return updated!;
    }),

  delete: protectedProcedure
    .input(FormIdSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.id, ctx.user.id);
      await db.delete(forms).where(eq(forms.id, input.id));
      return { success: true };
    }),

  duplicate: protectedProcedure
    .input(FormIdSchema)
    .mutation(async ({ ctx, input }) => {
      const original = await verifyFormOwnership(input.id, ctx.user.id);
      const originalFields = await db.query.fields.findMany({
        where: eq(fields.formId, input.id),
      });

      const baseSlug = slugifyTitle(`${original.title} copy`);
      const slug = await ensureUniqueSlug(baseSlug);

      const [copy] = await db
        .insert(forms)
        .values({
          userId: ctx.user.id,
          title: `${original.title} (Copy)`,
          description: original.description,
          slug,
          status: "draft",
          visibility: original.visibility,
          theme: original.theme,
          settings: original.settings,
        })
        .returning();

      if (!copy) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to duplicate form",
        });
      }

      if (originalFields.length > 0) {
        await db.insert(fields).values(
          originalFields.map((f) => ({
            formId: copy.id,
            type: f.type,
            label: f.label,
            description: f.description,
            placeholder: f.placeholder,
            required: f.required,
            order: f.order,
            options: f.options,
            validation: f.validation,
            conditionalLogic: f.conditionalLogic,
          })),
        );
      }

      await ensureFormAnalytics(copy.id);
      return copy;
    }),

  generateSlug: protectedProcedure
    .input(GenerateSlugSchema)
    .mutation(async ({ input }) => {
      const base = slugifyTitle(input.title);
      const slug = await ensureUniqueSlug(base);
      return { slug };
    }),

  updateSlug: protectedProcedure
    .input(UpdateSlugSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.id, ctx.user.id);

      const existing = await db.query.forms.findFirst({
        where: eq(forms.slug, input.slug),
      });

      if (existing && existing.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Slug already taken",
        });
      }

      const [updated] = await db
        .update(forms)
        .set({ slug: input.slug, updatedAt: new Date() })
        .where(eq(forms.id, input.id))
        .returning();

      return updated!;
    }),

  exportResponses: protectedProcedure
    .input(ExportResponsesSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.id, ctx.user.id);

      const formFields = await db.query.fields.findMany({
        where: eq(fields.formId, input.id),
        orderBy: (f, { asc }) => [asc(f.order)],
      });

      const formResponses = await db.query.responses.findMany({
        where: eq(responses.formId, input.id),
        with: { answers: true },
      });

      const fieldMap = new Map(formFields.map((f) => [f.id, f.label]));
      const fieldLabels = formFields.map((f) => f.label);

      const rows = formResponses.map((r) => {
        const row: Record<string, string | number | boolean | null> = {
          responseId: r.id,
          submittedAt: r.submittedAt.toISOString(),
          respondentEmail: r.respondentEmail,
          status: r.status,
        };

        for (const answer of r.answers) {
          const label = fieldMap.get(answer.fieldId) ?? answer.fieldId;
          const val = answer.value;
          row[label] =
            typeof val === "object" && val !== null
              ? JSON.stringify(val)
              : (val as string | number | boolean | null);
        }

        return row;
      });

      if (input.format === "csv") {
        return {
          format: "csv" as const,
          data: responsesToCsv(
            rows as Parameters<typeof responsesToCsv>[0],
            fieldLabels,
          ),
        };
      }

      return {
        format: "json" as const,
        data: responsesToJson(rows as Parameters<typeof responsesToJson>[0]),
      };
    }),
});
