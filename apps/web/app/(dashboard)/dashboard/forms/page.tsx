"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { LayoutGrid, List, MoreHorizontal, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/src/lib/trpc";
import { toastTrpcError } from "~/src/lib/trpc-error";

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "published" || status === "active"
      ? "default"
      : status === "archived"
        ? "secondary"
        : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

export default function FormsListPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const utils = trpc.useUtils();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("search");
    if (q) setSearch(q);
  }, []);

  const { data, isLoading } = trpc.forms.list.useQuery({
    page: 1,
    limit: 24,
    search: search || undefined,
  });

  const deleteForm = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      void utils.forms.list.invalidate();
    },
    onError: toastTrpcError,
  });

  const duplicateForm = trpc.forms.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Form duplicated");
      void utils.forms.list.invalidate();
    },
    onError: toastTrpcError,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Forms</h1>
          <p className="text-muted-foreground">
            {data?.total ?? 0} form{data?.total === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="size-4" />
            New form
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Search forms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm flex-1"
        />
        <div className="ml-auto flex gap-1">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((form) => (
            <Card key={form.id} className="group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/forms/${form.id}/edit`}
                      className="block truncate font-medium hover:text-primary"
                    >
                      {form.title}
                    </Link>
                    <div className="mt-2">
                      <StatusBadge status={form.status} />
                    </div>
                  </div>
                  <FormMenu
                    formId={form.id}
                    onDelete={() => deleteForm.mutate({ id: form.id })}
                    onDuplicate={() => duplicateForm.mutate({ id: form.id })}
                  />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {form.description || "No description"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {(form.analytics?.totalResponses ?? 0).toLocaleString()}{" "}
                  responses ·{" "}
                  {formatDistanceToNow(new Date(form.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Form</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Responses</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.items.map((form) => (
                  <tr key={form.id} className="border-b">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/forms/${form.id}/edit`}
                        className="font-medium hover:text-primary"
                      >
                        {form.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={form.status} />
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {form.analytics?.totalResponses ?? 0}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDistanceToNow(new Date(form.updatedAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <FormMenu
                        formId={form.id}
                        onDelete={() => deleteForm.mutate({ id: form.id })}
                        onDuplicate={() =>
                          duplicateForm.mutate({ id: form.id })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!isLoading && !data?.items.length && (
        <Card className="flex flex-col items-center py-16 text-center">
          <CardContent>
            <p className="font-medium">No forms yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first form to start collecting responses
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/forms/new">Create form</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FormMenu({
  formId,
  onDelete,
  onDuplicate,
}: {
  formId: string;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Form actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/forms/${formId}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/forms/${formId}/responses`}>Responses</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/forms/${formId}/analytics`}>Analytics</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={onDelete}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
