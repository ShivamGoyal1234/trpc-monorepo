import { randomBytes } from "node:crypto";

import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} from "@repo/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@repo/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createSession,
  invalidateSession,
  invalidateUserSessions,
} from "../lib/auth";
import { db, users } from "../lib/db";
import {
  createGoogleAuthUrl,
  isGoogleOAuthConfigured,
} from "../lib/google-oauth";
import { redis } from "../lib/redis";
import { sanitizeUser } from "../lib/user";
import { emailService } from "../services/email.service";

const PASSWORD_RESET_PREFIX = "password-reset:";
const PASSWORD_RESET_TTL = 60 * 60;

export const authRouter = createTRPCRouter({
  getAuthProviders: publicProcedure.query(() => ({
    google: isGoogleOAuthConfigured(),
  })),

  getGoogleAuthUrl: publicProcedure
    .input(
      z
        .object({
          callbackPath: z.string().optional(),
        })
        .optional(),
    )
    .mutation(async ({ input }) => {
      if (!isGoogleOAuthConfigured()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Google sign-in is not configured",
        });
      }

      const url = await createGoogleAuthUrl(input?.callbackPath);
      return { url };
    }),

  register: publicProcedure
    .input(RegisterSchema)
    .mutation(async ({ input }) => {
      const existing = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const [user] = await db
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          hashedPassword,
        })
        .returning();

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      const token = await createSession(user.id);
      void emailService.sendWelcome(user.email, user.name);

      return { user: sanitizeUser(user), token };
    }),

  login: publicProcedure.input(LoginSchema).mutation(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (!user?.hashedPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(input.password, user.hashedPassword);
    if (!valid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    const token = await createSession(user.id);
    return { user: sanitizeUser(user), token };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.token) {
      await invalidateSession(ctx.token);
    }
    return { success: true };
  }),

  me: protectedProcedure.query(({ ctx }) => sanitizeUser(ctx.user)),

  updateProfile: protectedProcedure
    .input(UpdateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return sanitizeUser(updated);
    }),

  changePassword: protectedProcedure
    .input(ChangePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.hashedPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password login not available",
        });
      }

      const valid = await bcrypt.compare(
        input.currentPassword,
        ctx.user.hashedPassword,
      );
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await db
        .update(users)
        .set({ hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id));

      await invalidateUserSessions(ctx.user.id);
      const token = await createSession(ctx.user.id);

      return { success: true, token };
    }),

  forgotPassword: publicProcedure
    .input(ForgotPasswordSchema)
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (user) {
        const resetToken = randomBytes(32).toString("hex");
        try {
          await redis.setex(
            `${PASSWORD_RESET_PREFIX}${resetToken}`,
            PASSWORD_RESET_TTL,
            user.id,
          );
        } catch {
          // Continue — reset won't work without Redis
        }
        void emailService.sendPasswordReset(user.email, user.name, resetToken);
      }

      return {
        success: true,
        message: "If that email exists, a reset link has been sent.",
      };
    }),

  resetPassword: publicProcedure
    .input(ResetPasswordSchema)
    .mutation(async ({ input }) => {
      let userId: string | null = null;

      try {
        userId = await redis.get(`${PASSWORD_RESET_PREFIX}${input.token}`);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const [updated] = await db
        .update(users)
        .set({ hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      try {
        await redis.del(`${PASSWORD_RESET_PREFIX}${input.token}`);
      } catch {
        // Ignore
      }

      await invalidateUserSessions(userId);
      const token = await createSession(userId);

      return { user: sanitizeUser(updated), token };
    }),
});
