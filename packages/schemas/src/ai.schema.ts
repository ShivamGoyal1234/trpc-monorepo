import { z } from "zod";

import { FieldTypeEnum, FieldValidationSchema } from "./field.schema";

export const GenerateFormSchema = z.object({
  prompt: z.string().min(10).max(1000),
  fieldCount: z.number().int().min(3).max(15).default(8),
});

export const GeneratedFieldSchema = z.object({
  type: FieldTypeEnum,
  label: z.string(),
  description: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
  required: z.boolean(),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .nullable()
    .optional(),
  validation: FieldValidationSchema.nullable().optional(),
});

export const SuggestedThemeEnum = z.enum([
  "midnight-hacker",
  "sakura-bloom",
  "retro-arcade",
  "corporate-clean",
  "forest-deep",
  "sunset-gradient",
]);

export const GeneratedFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  suggestedTheme: SuggestedThemeEnum,
  fields: z.array(GeneratedFieldSchema),
});

export const ImproveFieldSchema = z.object({
  fieldId: z.string().uuid(),
  instruction: z.string().min(1).max(500),
});

export const SuggestFieldsSchema = z.object({
  formId: z.string().uuid(),
  topic: z.string().optional(),
});
