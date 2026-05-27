import { z } from "zod";

export const VisibilityEnum = z.enum(["public", "unlisted"]);
export const StatusEnum = z.enum(["draft", "published", "archived"]);

export const ThemeConfigSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  cardColor: z.string(),
  borderColor: z.string(),
  fontFamily: z.string(),
  borderRadius: z.string(),
  buttonStyle: z.string(),
  backgroundImage: z.string().optional(),
  backgroundPattern: z.string().optional(),
});

export const DepthLevelEnum = z.enum([
  "shallow",
  "mesopelagic",
  "bathypelagic",
  "abyssal",
]);

export const FormSettingsSchema = z.object({
  submitMessage: z.string().optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  collectEmail: z.boolean().optional(),
  limitResponses: z.boolean().optional(),
  maxResponses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  passwordHash: z.string().optional(),
  allowMultipleResponses: z.boolean().optional(),
  showProgressBar: z.boolean().optional(),
  oneQuestionAtATime: z.boolean().optional(),
  depthLevel: DepthLevelEnum.optional(),
});

export const CreateFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  visibility: VisibilityEnum.default("unlisted"),
  theme: ThemeConfigSchema.optional(),
});

export const UpdateFormSchema = CreateFormSchema.partial().extend({
  settings: FormSettingsSchema.optional(),
});

export const ListFormsSchema = z.object({
  status: StatusEnum.optional(),
  visibility: VisibilityEnum.optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(12),
});

export const FormIdSchema = z.object({ id: z.string().uuid() });

export const UpdateSlugSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
});

export const GenerateSlugSchema = z.object({
  title: z.string().min(1),
});

export const ExportResponsesSchema = z.object({
  id: z.string().uuid(),
  format: z.enum(["csv", "json"]),
});
