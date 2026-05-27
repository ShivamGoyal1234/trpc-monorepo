"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { trpc } from "~/src/lib/trpc";
import { toastTrpcError } from "~/src/lib/trpc-error";

export default function FormResponsesPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const [selected, setSelected] = useState<string[]>([]);
  const utils = trpc.useUtils();

  const { data: form } = trpc.forms.getById.useQuery({ id: formId });
  const { data, isLoading } = trpc.responses.list.useQuery({
    formId,
    page: 1,
    limit: 50,
  });

  const bulkDelete = trpc.responses.bulkDelete.useMutation({
    onSuccess: () => {
      toast.success("Responses deleted");
      setSelected([]);
      void utils.responses.list.invalidate({ formId });
    },
    onError: toastTrpcError,
  });

  const exportMutation = trpc.forms.exportResponses.useMutation({
    onSuccess: (result) => {
      const blob = new Blob([result.data], {
        type: result.format === "csv" ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `responses.${result.format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    },
    onError: toastTrpcError,
  });

  const toggleAll = () => {
    if (selected.length === data?.items.length) {
      setSelected([]);
    } else {
      setSelected(data?.items.map((r) => r.id) ?? []);
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/edit`}>← Back to editor</Link>
          </Button>
          <h2 className="mt-2 text-2xl font-bold">
            {form?.title ?? "Form"} responses
          </h2>
          <p className="text-muted-foreground">
            {data?.total ?? 0} total responses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate({ id: formId, format: "csv" })}
            disabled={exportMutation.isPending}
          >
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          {selected.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => bulkDelete.mutate({ ids: selected })}
            >
              <Trash2 className="mr-2 size-4" />
              Delete ({selected.length})
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !data?.items.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No responses yet. Share your form to collect data.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        selected.length === data.items.length &&
                        data.items.length > 0
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Answers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(response.id)}
                        onCheckedChange={() => toggleOne(response.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(response.submittedAt), "PPp")}
                    </TableCell>
                    <TableCell>
                      {response.respondentEmail ?? "—"}
                    </TableCell>
                    <TableCell>{response.status}</TableCell>
                    <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                      {response.answers
                        .map((a) => JSON.stringify(a.value))
                        .join(" · ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
