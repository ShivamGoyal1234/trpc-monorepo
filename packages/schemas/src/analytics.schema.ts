import { z } from "zod";

export const GetFormAnalyticsSchema = z.object({
  formId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(["7d", "30d", "90d", "custom"]).default("30d"),
});

export const RecordFormViewSchema = z.object({
  formId: z.string().uuid(),
});

export const GetPublicFormSchema = z.object({
  idOrSlug: z.string().min(1),
  password: z.string().optional(),
});

export const GetPublicFormsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
});
