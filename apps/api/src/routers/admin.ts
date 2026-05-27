import {
  AdminGetFormsSchema,
  DeleteUserSchema,
  GetUsersSchema,
  UpdateUserRoleSchema,
} from "@repo/schemas";
import {
  adminProcedure,
  createTRPCRouter,
} from "@repo/trpc";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { db, forms, responses, users } from "../lib/db";
import { sanitizeUser } from "../lib/user";

export const adminRouter = createTRPCRouter({
  getUsers: adminProcedure.input(GetUsersSchema).query(async ({ input }) => {
    const offset = (input.page - 1) * input.limit;
    const conditions = [];

    if (input.role) {
      conditions.push(eq(users.role, input.role));
    }
    if (input.search) {
      conditions.push(
        or(
          ilike(users.email, `%${input.search}%`),
          ilike(users.name, `%${input.search}%`),
        )!,
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [totalRow]] = await Promise.all([
      db.query.users.findMany({
        where,
        orderBy: [desc(users.createdAt)],
        limit: input.limit,
        offset,
      }),
      db.select({ total: count() }).from(users).where(where),
    ]);

    return {
      items: items.map(sanitizeUser),
      total: Number(totalRow?.total ?? 0),
      page: input.page,
      limit: input.limit,
    };
  }),

  updateUserRole: adminProcedure
    .input(UpdateUserRoleSchema)
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(users)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(users.id, input.userId))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return sanitizeUser(updated);
    }),

  deleteUser: adminProcedure
    .input(DeleteUserSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete your own account",
        });
      }

      await db.delete(users).where(eq(users.id, input.userId));
      return { success: true };
    }),

  getSystemStats: adminProcedure.query(async () => {
    const [[userCount], [formCount], [responseCount]] = await Promise.all([
      db.select({ total: count() }).from(users),
      db.select({ total: count() }).from(forms),
      db.select({ total: count() }).from(responses),
    ]);

    const publishedForms = await db
      .select({ total: count() })
      .from(forms)
      .where(eq(forms.status, "published"));

    return {
      totalUsers: Number(userCount?.total ?? 0),
      totalForms: Number(formCount?.total ?? 0),
      publishedForms: Number(publishedForms[0]?.total ?? 0),
      totalResponses: Number(responseCount?.total ?? 0),
    };
  }),

  getForms: adminProcedure
    .input(AdminGetFormsSchema)
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [];

      if (input.userId) {
        conditions.push(eq(forms.userId, input.userId));
      }
      if (input.status) {
        conditions.push(eq(forms.status, input.status));
      }
      if (input.visibility) {
        conditions.push(eq(forms.visibility, input.visibility));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, [totalRow]] = await Promise.all([
        db.query.forms.findMany({
          where,
          orderBy: [desc(forms.updatedAt)],
          limit: input.limit,
          offset,
          with: { user: { columns: { id: true, name: true, email: true } } },
        }),
        db.select({ total: count() }).from(forms).where(where),
      ]);

      return {
        items,
        total: Number(totalRow?.total ?? 0),
        page: input.page,
        limit: input.limit,
      };
    }),
});
