import {
  BulkDeleteResponsesSchema,
  ExportFormResponsesSchema,
  ListResponsesSchema,
} from "@repo/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@repo/trpc";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gte, ilike, inArray, lte } from "drizzle-orm";
import { z } from "zod";

import { verifyFormOwnership } from "../lib/forms";
import { db, fields, responses } from "../lib/db";
import { responsesToCsv, responsesToJson } from "../lib/export";
import { incrementResponseStats } from "../services/analytics.service";

export const responsesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(ListResponsesSchema)
    .query(async ({ ctx, input }) => {
      await verifyFormOwnership(input.formId, ctx.user.id);

      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(responses.formId, input.formId)];

      if (input.status) {
        conditions.push(eq(responses.status, input.status));
      }
      if (input.startDate) {
        conditions.push(gte(responses.submittedAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(responses.submittedAt, new Date(input.endDate)));
      }
      if (input.search) {
        conditions.push(ilike(responses.respondentEmail, `%${input.search}%`));
      }

      const where = and(...conditions);

      const [items, [totalRow]] = await Promise.all([
        db.query.responses.findMany({
          where,
          orderBy: [desc(responses.submittedAt)],
          limit: input.limit,
          offset,
          with: { answers: true },
        }),
        db.select({ total: count() }).from(responses).where(where),
      ]);

      return {
        items,
        total: Number(totalRow?.total ?? 0),
        page: input.page,
        limit: input.limit,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const response = await db.query.responses.findFirst({
        where: eq(responses.id, input.id),
        with: { answers: true, form: true },
      });

      if (!response) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Response not found",
        });
      }

      await verifyFormOwnership(response.formId, ctx.user.id);
      return response;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const response = await db.query.responses.findFirst({
        where: eq(responses.id, input.id),
      });

      if (!response) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Response not found",
        });
      }

      await verifyFormOwnership(response.formId, ctx.user.id);
      await db.delete(responses).where(eq(responses.id, input.id));
      await incrementResponseStats(response.formId);
      return { success: true };
    }),

  bulkDelete: protectedProcedure
    .input(BulkDeleteResponsesSchema)
    .mutation(async ({ ctx, input }) => {
      const toDelete = await db.query.responses.findMany({
        where: inArray(responses.id, input.ids),
      });

      if (toDelete.length === 0) {
        return { deleted: 0 };
      }

      const formIds = [...new Set(toDelete.map((r) => r.formId))];
      for (const formId of formIds) {
        await verifyFormOwnership(formId, ctx.user.id);
      }

      await db.delete(responses).where(inArray(responses.id, input.ids));

      for (const formId of formIds) {
        await incrementResponseStats(formId);
      }

      return { deleted: toDelete.length };
    }),

  export: protectedProcedure
    .input(ExportFormResponsesSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.formId, ctx.user.id);

      const formFields = await db.query.fields.findMany({
        where: eq(fields.formId, input.formId),
        orderBy: (f, { asc }) => [asc(f.order)],
      });

      const formResponses = await db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
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
