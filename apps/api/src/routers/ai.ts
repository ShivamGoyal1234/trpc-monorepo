import {
  GenerateFormSchema,
  ImproveFieldSchema,
  SuggestFieldsSchema,
} from "@repo/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@repo/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { verifyFormOwnership } from "../lib/forms";
import { db, fields } from "../lib/db";
import { aiService } from "../services/ai.service";

export const aiRouter = createTRPCRouter({
  generateForm: protectedProcedure
    .input(GenerateFormSchema)
    .mutation(async ({ input }) => {
      return aiService.generateForm(input.prompt, input.fieldCount);
    }),

  improveField: protectedProcedure
    .input(ImproveFieldSchema)
    .mutation(async ({ ctx, input }) => {
      const field = await db.query.fields.findFirst({
        where: eq(fields.id, input.fieldId),
      });

      if (!field) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field not found" });
      }

      await verifyFormOwnership(field.formId, ctx.user.id);

      const improved = await aiService.improveField(
        field.label,
        field.type,
        input.instruction,
      );

      const [updated] = await db
        .update(fields)
        .set({
          label: improved.label,
          description: improved.description,
          placeholder: improved.placeholder,
          required: improved.required,
          updatedAt: new Date(),
        })
        .where(eq(fields.id, input.fieldId))
        .returning();

      return updated!;
    }),

  suggestFields: protectedProcedure
    .input(SuggestFieldsSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await verifyFormOwnership(input.formId, ctx.user.id);
      return aiService.suggestFields(
        form.title,
        form.description,
        input.topic,
      );
    }),
});
