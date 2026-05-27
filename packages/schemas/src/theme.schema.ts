import { z } from "zod";

import { ThemeConfigSchema } from "./form.schema";

export const CreateThemeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  config: ThemeConfigSchema,
});

export const UpdateThemeSchema = CreateThemeSchema.partial();

export const ThemeIdSchema = z.object({ id: z.string().uuid() });
