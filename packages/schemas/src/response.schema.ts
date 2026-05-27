import { z } from "zod";

export const AnswerSchema = z.object({
  fieldId: z.string().uuid(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null(),
  ]),
});

export const SubmitResponseSchema = z.object({
  formId: z.string().uuid(),
  answers: z.array(AnswerSchema).min(1),
  respondentEmail: z.string().email().optional(),
  formPassword: z.string().optional(),
});

export const ListResponsesSchema = z.object({
  formId: z.string().uuid(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["complete", "partial"]).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const BulkDeleteResponsesSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const ExportFormResponsesSchema = z.object({
  formId: z.string().uuid(),
  format: z.enum(["csv", "json"]),
});
