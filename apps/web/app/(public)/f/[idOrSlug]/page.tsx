"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PublicFormRenderer } from "~/src/components/public/form-renderer";
import { trpc } from "~/src/lib/trpc";
import { getTrpcErrorMessage } from "~/src/lib/trpc-error";
import type { ThemeConfig } from "~/src/types/form";

export default function PublicFormPage() {
  const params = useParams<{ idOrSlug: string }>();
  const [password, setPassword] = useState("");
  const { data, isLoading, error } = trpc.public.getForm.useQuery({
    idOrSlug: params.idOrSlug,
    password: password || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const errorMessage = error ? getTrpcErrorMessage(error) : "";
  const requiresPassword = /password required|invalid form password/i.test(
    errorMessage,
  );

  if (requiresPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border bg-card p-6">
          <h1 className="text-xl font-semibold">Password-protected form</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the form password to continue.
          </p>
          <Input
            type="password"
            className="mt-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Form password"
          />
          <Button
            className="mt-3 w-full"
            onClick={() => setPassword((prev) => prev.trim())}
          >
            Unlock
          </Button>
          {errorMessage ? (
            <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Form not found</h1>
        <p className="text-muted-foreground">
          {errorMessage ||
            "This form may be unpublished or the link is incorrect."}
        </p>
      </div>
    );
  }

  return (
    <PublicFormRenderer
      formPassword={password || undefined}
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
  );
}
