import {
  CreateThemeSchema,
  ThemeIdSchema,
  UpdateThemeSchema,
} from "@repo/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@repo/trpc";
import { TRPCError } from "@trpc/server";
import { desc, eq, or } from "drizzle-orm";

import { db, themes } from "../lib/db";

export const themesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.query.themes.findMany({
      where: or(eq(themes.isSystem, true), eq(themes.userId, ctx.user.id)),
      orderBy: [desc(themes.createdAt)],
    });
  }),

  getById: protectedProcedure
    .input(ThemeIdSchema)
    .query(async ({ ctx, input }) => {
      const theme = await db.query.themes.findFirst({
        where: eq(themes.id, input.id),
      });

      if (!theme) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Theme not found" });
      }

      if (!theme.isSystem && theme.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return theme;
    }),

  create: protectedProcedure
    .input(CreateThemeSchema)
    .mutation(async ({ ctx, input }) => {
      const [theme] = await db
        .insert(themes)
        .values({
          name: input.name,
          description: input.description,
          config: input.config,
          userId: ctx.user.id,
          isSystem: false,
        })
        .returning();

      return theme!;
    }),

  update: protectedProcedure
    .input(UpdateThemeSchema.extend({ id: ThemeIdSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.themes.findFirst({
        where: eq(themes.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Theme not found" });
      }

      if (existing.isSystem || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const { id, ...data } = input;
      const [updated] = await db
        .update(themes)
        .set(data)
        .where(eq(themes.id, id))
        .returning();

      return updated!;
    }),

  delete: protectedProcedure
    .input(ThemeIdSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.themes.findFirst({
        where: eq(themes.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Theme not found" });
      }

      if (existing.isSystem || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await db.delete(themes).where(eq(themes.id, input.id));
      return { success: true };
    }),
});
