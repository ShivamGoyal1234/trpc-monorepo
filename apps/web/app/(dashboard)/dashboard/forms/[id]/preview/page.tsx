"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { PublicFormRenderer } from "~/src/components/public/form-renderer";
import { trpc } from "~/src/lib/trpc";
import type { ThemeConfig } from "~/src/types/form";

export default function FormPreviewPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, error } = trpc.forms.getById.useQuery({
    id: params.id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Preview unavailable</h1>
        <p className="text-muted-foreground">
          Unable to load this form preview.
        </p>
        <Button asChild variant="outline">
          <Link href={`/dashboard/forms/${params.id}/edit`}>Back to edit</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b bg-background/90 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Preview mode for draft form
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/forms/${params.id}/edit`}>Back to edit</Link>
          </Button>
        </div>
      </div>
      <PublicFormRenderer
        isPreview
        form={{
          id: data.id,
          title: data.title,
          description: data.description,
          theme: data.theme as ThemeConfig,
          settings: (data.settings as {
            oneQuestionAtATime?: boolean;
            showProgressBar?: boolean;
          } | null) ?? null,
          fields: data.fields.map((f) => ({
            id: f.id,
            type: f.type,
            label: f.label,
            description: f.description,
            placeholder: f.placeholder,
            required: f.required,
            options: f.options as { value: string; label: string }[] | null,
          })),
        }}
      />
    </div>
  );
}
