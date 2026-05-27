import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { db, forms } from "./db";

export async function verifyFormOwnership(formId: string, userId: string) {
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  });

  if (!form) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
  }

  if (form.userId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
  }

  return form;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const existing = await db.query.forms.findFirst({
      where: eq(forms.slug, slug),
    });
    if (!existing) {
      return slug;
    }
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}
