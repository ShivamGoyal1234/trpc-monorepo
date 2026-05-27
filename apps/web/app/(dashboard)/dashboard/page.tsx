"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, Eye, MessageSquare, Plus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/src/lib/trpc";

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "published" || status === "active"
      ? "default"
      : status === "archived"
        ? "secondary"
        : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

export default function DashboardPage() {
  const { data, isLoading } = trpc.analytics.getDashboardStats.useQuery();

  const chartData =
    data?.recentForms.map((f) => ({
      name: f.title.slice(0, 12) + (f.title.length > 12 ? "…" : ""),
      responses: f.analytics?.totalResponses ?? 0,
      views: f.analytics?.totalViews ?? 0,
    })) ?? [];

  const topForms = [...(data?.recentForms ?? [])]
    .sort(
      (a, b) =>
        (b.analytics?.totalResponses ?? 0) - (a.analytics?.totalResponses ?? 0),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Total forms",
      value: data?.totalForms ?? 0,
      icon: FileText,
    },
    {
      label: "Responses",
      value: data?.totalResponses ?? 0,
      icon: MessageSquare,
    },
    {
      label: "Views",
      value: data?.totalViews ?? 0,
      icon: Eye,
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your forms and responses
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{s.label}</CardDescription>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold tabular-nums">
                  {s.value.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Responses and views by form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-muted-foreground">
                Create a form to see analytics
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    name="Responses"
                    stroke="#2dd4bf"
                    fill="url(#fillResponses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent forms</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : !data?.recentForms.length ? (
              <p className="text-muted-foreground">
                No forms yet. Create your first form to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Form</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Responses</th>
                      <th className="pb-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentForms.map((form) => (
                      <tr key={form.id} className="border-b">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/dashboard/forms/${form.id}/edit`}
                            className="font-medium hover:text-primary"
                          >
                            {form.title}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={form.status} />
                        </td>
                        <td className="py-3 pr-4 tabular-nums">
                          {form.analytics?.totalResponses ?? 0}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatDistanceToNow(new Date(form.updatedAt), {
                            addSuffix: true,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top forms</CardTitle>
            <CardDescription>By response count</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : topForms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <ol className="space-y-3">
                {topForms.map((form, i) => (
                  <li key={form.id}>
                    <Link
                      href={`/dashboard/forms/${form.id}/edit`}
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {form.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(form.analytics?.totalResponses ?? 0).toLocaleString()}{" "}
                          responses
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Button className="fixed bottom-8 right-8 z-20 gap-2 shadow-lg" asChild>
        <Link href="/dashboard/forms/new">
          <Plus className="size-4" />
          New form
        </Link>
      </Button>
    </div>
  );
}
