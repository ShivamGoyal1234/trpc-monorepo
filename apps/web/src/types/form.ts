import type { z } from "zod";

import type { FieldTypeEnum, ThemeConfigSchema } from "@repo/schemas";

export type FieldType = z.infer<typeof FieldTypeEnum>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

export type FormField = {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  order: number;
  options: { value: string; label: string }[] | null;
  validation: Record<string, unknown> | null;
  conditionalLogic: Record<string, unknown> | null;
};

export type FormRecord = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  slug: string | null;
  status: "draft" | "published" | "archived";
  visibility: "public" | "unlisted";
  theme: ThemeConfig;
  settings: Record<string, unknown>;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
