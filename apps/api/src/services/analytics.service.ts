import { and, count, eq, gte, inArray, lte, sql, sum } from "drizzle-orm";

import {
  db,
  formAnalytics,
  forms,
  responses,
} from "../lib/db";

export async function ensureFormAnalytics(formId: string) {
  const existing = await db.query.formAnalytics.findFirst({
    where: eq(formAnalytics.formId, formId),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(formAnalytics)
    .values({ formId })
    .returning();

  return created!;
}

export async function incrementResponseStats(
  formId: string,
  completionTime?: number | null,
) {
  await ensureFormAnalytics(formId);

  const [stats] = await db
    .select({
      total: count(),
      avgTime: sql<number>`coalesce(avg(${responses.completionTime}), 0)`,
    })
    .from(responses)
    .where(eq(responses.formId, formId));

  const totalResponses = Number(stats?.total ?? 0);
  const avgCompletionTime = Math.round(Number(stats?.avgTime ?? 0));

  const [viewRow] = await db
    .select({ views: formAnalytics.totalViews })
    .from(formAnalytics)
    .where(eq(formAnalytics.formId, formId));

  const views = viewRow?.views ?? 0;
  const completionRate =
    views > 0 ? ((totalResponses / views) * 100).toFixed(2) : "0";

  await db
    .update(formAnalytics)
    .set({
      totalResponses,
      avgCompletionTime: completionTime
        ? Math.round(
            (avgCompletionTime * (totalResponses - 1) + completionTime) /
              totalResponses,
          )
        : avgCompletionTime,
      completionRate,
      lastResponseAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(formAnalytics.formId, formId));
}

export async function flushFormViews(
  formId: string,
  viewCount: number,
): Promise<void> {
  await ensureFormAnalytics(formId);

  await db
    .update(formAnalytics)
    .set({
      totalViews: sql`${formAnalytics.totalViews} + ${viewCount}`,
      updatedAt: new Date(),
    })
    .where(eq(formAnalytics.formId, formId));

  const [row] = await db
    .select({
      views: formAnalytics.totalViews,
      responses: formAnalytics.totalResponses,
    })
    .from(formAnalytics)
    .where(eq(formAnalytics.formId, formId));

  if (row && row.views > 0) {
    const rate = ((row.responses / row.views) * 100).toFixed(2);
    await db
      .update(formAnalytics)
      .set({ completionRate: rate })
      .where(eq(formAnalytics.formId, formId));
  }
}

export async function getFormAnalyticsData(
  formId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const analytics = await ensureFormAnalytics(formId);

  const conditions = [eq(responses.formId, formId)];
  if (startDate) {
    conditions.push(gte(responses.submittedAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(responses.submittedAt, endDate));
  }

  const [responseStats] = await db
    .select({
      count: count(),
      avgCompletionTime: sql<number>`coalesce(avg(${responses.completionTime}), 0)`,
    })
    .from(responses)
    .where(and(...conditions));

  return {
    analytics,
    periodResponses: Number(responseStats?.count ?? 0),
    periodAvgCompletionTime: Math.round(
      Number(responseStats?.avgCompletionTime ?? 0),
    ),
  };
}

export async function getDashboardStatsForUser(userId: string) {
  const [formStats] = await db
    .select({ totalForms: count() })
    .from(forms)
    .where(eq(forms.userId, userId));

  const userForms = await db.query.forms.findMany({
    where: eq(forms.userId, userId),
    columns: { id: true },
  });

  const formIds = userForms.map((f) => f.id);

  let totalResponses = 0;
  let totalViews = 0;

  if (formIds.length > 0) {
    const [respCount] = await db
      .select({ total: count() })
      .from(responses)
      .where(inArray(responses.formId, formIds));

    const [viewSum] = await db
      .select({ total: sum(formAnalytics.totalViews) })
      .from(formAnalytics)
      .where(inArray(formAnalytics.formId, formIds));

    totalResponses = Number(respCount?.total ?? 0);
    totalViews = Number(viewSum?.total ?? 0);
  }

  const recentForms = await db.query.forms.findMany({
    where: eq(forms.userId, userId),
    orderBy: (f, { desc }) => [desc(f.updatedAt)],
    limit: 5,
    with: { analytics: true },
  });

  return {
    totalForms: Number(formStats?.totalForms ?? 0),
    totalResponses,
    totalViews,
    recentForms,
  };
}
