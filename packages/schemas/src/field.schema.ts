import { z } from "zod";

export const FieldTypeEnum = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "url",
  "date",
  "time",
  "select",
  "multi_select",
  "checkbox",
  "rating",
  "scale",
  "file",
  "matrix",
  "ranking",
  "statement",
]);

export const FieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const FieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  customMessage: z.string().optional(),
});

export const ConditionalOperatorEnum = z.enum([
  "equals",
  "not_equals",
  "contains",
  "greater_than",
  "less_than",
  "is_empty",
  "is_not_empty",
]);

export const ConditionalLogicSchema = z.object({
  enabled: z.boolean(),
  action: z.enum(["show", "hide"]),
  match: z.enum(["all", "any"]),
  conditions: z.array(
    z.object({
      fieldId: z.string().uuid(),
      operator: ConditionalOperatorEnum,
      value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    }),
  ),
});

export const CreateFieldSchema = z.object({
  formId: z.string().uuid(),
  type: FieldTypeEnum,
  label: z.string().min(1),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  order: z.number().int().optional(),
  options: z.array(FieldOptionSchema).optional(),
  validation: FieldValidationSchema.optional(),
  conditionalLogic: ConditionalLogicSchema.optional(),
});

export const UpdateFieldSchema = CreateFieldSchema.omit({ formId: true }).partial();

export const ReorderFieldsSchema = z.object({
  formId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()),
});

export const FieldIdSchema = z.object({ id: z.string().uuid() });

export const ListFieldsSchema = z.object({ formId: z.string().uuid() });
