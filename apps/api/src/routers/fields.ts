import {
  CreateFieldSchema,
  FieldIdSchema,
  ListFieldsSchema,
  ReorderFieldsSchema,
  UpdateFieldSchema,
} from "@repo/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@repo/trpc";
import { TRPCError } from "@trpc/server";
import { eq, max } from "drizzle-orm";

import { verifyFormOwnership } from "../lib/forms";
import { db, fields } from "../lib/db";

export const fieldsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(ListFieldsSchema)
    .query(async ({ ctx, input }) => {
      await verifyFormOwnership(input.formId, ctx.user.id);
      return db.query.fields.findMany({
        where: eq(fields.formId, input.formId),
        orderBy: (f, { asc }) => [asc(f.order)],
      });
    }),

  create: protectedProcedure
    .input(CreateFieldSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.formId, ctx.user.id);

      let order = input.order;
      if (order === undefined) {
        const [result] = await db
          .select({ maxOrder: max(fields.order) })
          .from(fields)
          .where(eq(fields.formId, input.formId));
        order = (result?.maxOrder ?? -1) + 1;
      }

      const [field] = await db
        .insert(fields)
        .values({
          formId: input.formId,
          type: input.type,
          label: input.label,
          description: input.description,
          placeholder: input.placeholder,
          required: input.required ?? false,
          order,
          options: input.options,
          validation: input.validation,
          conditionalLogic: input.conditionalLogic,
        })
        .returning();

      return field!;
    }),

  update: protectedProcedure
    .input(UpdateFieldSchema.extend({ id: FieldIdSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.fields.findFirst({
        where: eq(fields.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field not found" });
      }

      await verifyFormOwnership(existing.formId, ctx.user.id);
      const { id, ...data } = input;

      const [updated] = await db
        .update(fields)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(fields.id, id))
        .returning();

      return updated!;
    }),

  delete: protectedProcedure
    .input(FieldIdSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.fields.findFirst({
        where: eq(fields.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field not found" });
      }

      await verifyFormOwnership(existing.formId, ctx.user.id);
      await db.delete(fields).where(eq(fields.id, input.id));
      return { success: true };
    }),

  reorder: protectedProcedure
    .input(ReorderFieldsSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyFormOwnership(input.formId, ctx.user.id);

      await Promise.all(
        input.orderedIds.map((fieldId, index) =>
          db
            .update(fields)
            .set({ order: index, updatedAt: new Date() })
            .where(eq(fields.id, fieldId)),
        ),
      );

      return db.query.fields.findMany({
        where: eq(fields.formId, input.formId),
        orderBy: (f, { asc }) => [asc(f.order)],
      });
    }),

  duplicate: protectedProcedure
    .input(FieldIdSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.fields.findFirst({
        where: eq(fields.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field not found" });
      }

      await verifyFormOwnership(existing.formId, ctx.user.id);

      const [maxResult] = await db
        .select({ maxOrder: max(fields.order) })
        .from(fields)
        .where(eq(fields.formId, existing.formId));

      const [copy] = await db
        .insert(fields)
        .values({
          formId: existing.formId,
          type: existing.type,
          label: `${existing.label} (Copy)`,
          description: existing.description,
          placeholder: existing.placeholder,
          required: existing.required,
          order: (maxResult?.maxOrder ?? 0) + 1,
          options: existing.options,
          validation: existing.validation,
          conditionalLogic: existing.conditionalLogic,
        })
        .returning();

      return copy!;
    }),
});
