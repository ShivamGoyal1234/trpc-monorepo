"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Gauge, Timer, Users, View } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { trpc } from "~/src/lib/trpc";

type Period = "7d" | "30d" | "90d";

export default function FormAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const [period, setPeriod] = useState<Period>("30d");

  const { data: form } = trpc.forms.getById.useQuery({ id: formId });
  const { data, isLoading } = trpc.analytics.getFormAnalytics.useQuery({
    formId,
    period,
  });

  const overviewData = [
    {
      name: "Views",
      value: data?.analytics.totalViews ?? 0,
    },
    {
      name: "Responses",
      value: data?.analytics.totalResponses ?? 0,
    },
    {
      name: "Period responses",
      value: data?.periodResponses ?? 0,
    },
  ];

  const totalViews = Number(data?.analytics.totalViews ?? 0);
  const totalResponses = Number(data?.analytics.totalResponses ?? 0);
  const periodResponses = Number(data?.periodResponses ?? 0);
  const completionRate = Number(data?.analytics.completionRate ?? 0);
  const avgCompletionTime = Number(data?.analytics.avgCompletionTime ?? 0);
  const dropOffRate = Math.max(0, 100 - completionRate);
  const responseVelocity = totalViews > 0 ? (periodResponses / totalViews) * 100 : 0;

  const trendData = [
    { name: "Completion", value: Number(completionRate.toFixed(2)) },
    { name: "Drop-off", value: Number(dropOffRate.toFixed(2)) },
    { name: "Velocity", value: Number(responseVelocity.toFixed(2)) },
  ];

  const kpis = [
    {
      label: "Total views",
      value: totalViews.toLocaleString(),
      hint: "All-time visits",
      icon: View,
      trend: totalViews > totalResponses ? "up" : "flat",
    },
    {
      label: "Total responses",
      value: totalResponses.toLocaleString(),
      hint: `+${periodResponses} in selected period`,
      icon: Users,
      trend: periodResponses > 0 ? "up" : "flat",
    },
    {
      label: "Completion rate",
      value: `${completionRate.toFixed(2)}%`,
      hint: `${dropOffRate.toFixed(2)}% drop-off`,
      icon: Gauge,
      trend: completionRate >= 60 ? "up" : "down",
    },
    {
      label: "Avg completion time",
      value: `${avgCompletionTime.toFixed(0)}s`,
      hint: "Average submit duration",
      icon: Timer,
      trend: "flat",
    },
  ] as const;

  const periodLabel: Record<Period, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/edit`}>← Back to editor</Link>
          </Button>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {form?.title ?? "Form"} analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Performance snapshot for {periodLabel[period]}
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon =
            stat.trend === "up"
              ? ArrowUpRight
              : stat.trend === "down"
                ? ArrowDownRight
                : null;

          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{stat.hint}</p>
                  {TrendIcon ? (
                    <Badge
                      variant="outline"
                      className={
                        stat.trend === "up"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    >
                      <TrendIcon className="mr-1 size-3" />
                      {stat.trend === "up" ? "Healthy" : "Needs work"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Stable</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Traffic vs conversion</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Quality trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Funnel conversion</p>
            <p className="mt-1 text-muted-foreground">
              {completionRate.toFixed(2)}% of visitors complete this form.
            </p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Response velocity</p>
            <p className="mt-1 text-muted-foreground">
              {responseVelocity.toFixed(2)}% responses per view in {periodLabel[period].toLowerCase()}.
            </p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Optimization hint</p>
            <p className="mt-1 text-muted-foreground">
              {completionRate < 50
                ? "Try shortening form steps or making fewer fields required."
                : "Performance looks good. Consider testing stronger CTA copy."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
