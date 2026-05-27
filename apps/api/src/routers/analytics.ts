import { GetFormAnalyticsSchema } from "@repo/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@repo/trpc";

import { verifyFormOwnership } from "../lib/forms";
import {
  getDashboardStatsForUser,
  getFormAnalyticsData,
} from "../services/analytics.service";

function resolveDateRange(
  period: "7d" | "30d" | "90d" | "custom",
  startDate?: string,
  endDate?: string,
): { start?: Date; end?: Date } {
  if (period === "custom") {
    return {
      start: startDate ? new Date(startDate) : undefined,
      end: endDate ? new Date(endDate) : undefined,
    };
  }

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end: new Date() };
}

export const analyticsRouter = createTRPCRouter({
  getFormAnalytics: protectedProcedure
    .input(GetFormAnalyticsSchema)
    .query(async ({ ctx, input }) => {
      await verifyFormOwnership(input.formId, ctx.user.id);
      const { start, end } = resolveDateRange(
        input.period,
        input.startDate,
        input.endDate,
      );
      return getFormAnalyticsData(input.formId, start, end);
    }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    return getDashboardStatsForUser(ctx.user.id);
  }),
});
