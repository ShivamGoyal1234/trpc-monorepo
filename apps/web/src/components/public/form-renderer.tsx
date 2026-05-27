"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { trpc } from "~/src/lib/trpc";
import { toastTrpcError } from "~/src/lib/trpc-error";
import type { ThemeConfig } from "~/src/types/form";

type PublicField = {
  id: string;
  type: string;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  options: { value: string; label: string }[] | null;
};

type PublicForm = {
  id: string;
  title: string;
  description: string | null;
  theme: ThemeConfig;
  fields: PublicField[];
  settings?: {
    oneQuestionAtATime?: boolean;
    showProgressBar?: boolean;
  } | null;
};

export function PublicFormRenderer({
  form,
  formPassword,
  isPreview = false,
}: {
  form: PublicForm;
  formPassword?: string;
  isPreview?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const rhf = useForm<Record<string, string | string[] | boolean>>({
    defaultValues: {},
  });

  const recordView = trpc.public.recordFormView.useMutation();

  useEffect(() => {
    if (isPreview) return;
    recordView.mutate({ formId: form.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id, isPreview]);

  const submit = trpc.public.submitResponse.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Response submitted. Thank you!");
    },
    onError: toastTrpcError,
  });

  const onSubmit = rhf.handleSubmit((values) => {
    const answers = form.fields
      .filter((f) => f.type !== "statement")
      .map((field) => {
        const raw = values[field.id];
        let value: string | number | boolean | string[] | null = null;
        if (Array.isArray(raw)) value = raw;
        else if (typeof raw === "boolean") value = raw;
        else if (raw !== undefined && raw !== "") value = String(raw);
        return { fieldId: field.id, value };
      })
      .filter((a) => a.value !== null);

    if (answers.length === 0) {
      toast.error("Please complete at least one field");
      return;
    }

    submit.mutate({
      formId: form.id,
      answers,
      respondentEmail:
        typeof values._email === "string" ? values._email : undefined,
      formPassword,
    });
  });

  const hasSectionBreaks = form.fields.some((f) => f.type === "statement");
  const stepMode = Boolean(form.settings?.oneQuestionAtATime) || hasSectionBreaks;

  const pages: PublicField[][] = (() => {
    if (form.settings?.oneQuestionAtATime) {
      return form.fields
        .filter((f) => f.type !== "statement")
        .map((f) => [f]);
    }

    if (!hasSectionBreaks) {
      return [form.fields];
    }

    const grouped: PublicField[][] = [];
    let current: PublicField[] = [];

    for (const field of form.fields) {
      if (field.type === "statement") {
        if (current.length > 0) grouped.push(current);
        current = [field];
      } else {
        current.push(field);
      }
    }
    if (current.length > 0) grouped.push(current);
    return grouped.length > 0 ? grouped : [form.fields];
  })();

  const totalSteps = pages.length;
  const activeStep = Math.min(currentStep, Math.max(totalSteps - 1, 0));
  const visibleFields = stepMode ? pages[activeStep] ?? [] : form.fields;
  const progressValue =
    totalSteps > 0 ? Math.round(((activeStep + 1) / totalSteps) * 100) : 0;

  const validateCurrentStep = (): boolean => {
    if (!stepMode) return true;
    const requiredFields = visibleFields.filter(
      (f) => f.type !== "statement" && f.required,
    );
    for (const field of requiredFields) {
      const value = rhf.getValues(field.id);
      const emptyArray = Array.isArray(value) && value.length === 0;
      const emptyString = typeof value === "string" && value.trim() === "";
      if (value === undefined || value === null || emptyArray || emptyString) {
        toast.error(`Please complete "${field.label}"`);
        return false;
      }
    }
    return true;
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-xl font-semibold">Thank you!</h2>
            <p className="mt-2 text-muted-foreground">
              Your response has been recorded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{form.title}</CardTitle>
            {form.description ? (
              <p className="text-muted-foreground">{form.description}</p>
            ) : null}
            {stepMode && (form.settings?.showProgressBar ?? true) ? (
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Step {activeStep + 1} of {totalSteps}
                  </span>
                  <span>{progressValue}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            ) : null}
          </CardHeader>
        </Card>

        {visibleFields.map((field) => (
          <Card key={field.id}>
            <CardContent className="pt-6">
              {field.type === "statement" ? (
                <p className="border-l-4 border-primary pl-4 text-sm">
                  {field.label}
                </p>
              ) : (
                <>
                  <Label>
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </Label>
                  {field.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <FieldInput
                      field={field}
                      register={rhf.register}
                      setValue={rhf.setValue}
                      watch={rhf.watch}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}

        {stepMode ? (
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={activeStep === 0}
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            >
              Previous
            </Button>

            {activeStep < totalSteps - 1 ? (
              <Button
                type="button"
                onClick={() => {
                  if (!validateCurrentStep()) return;
                  setCurrentStep((s) => Math.min(totalSteps - 1, s + 1));
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submit.isPending || isPreview}
                onClick={(e) => {
                  if (!validateCurrentStep()) {
                    e.preventDefault();
                  }
                }}
              >
                {isPreview
                  ? "Preview mode (submission disabled)"
                  : submit.isPending
                    ? "Submitting…"
                    : "Submit"}
              </Button>
            )}
          </div>
        ) : (
          <Button
            type="submit"
            className="w-full"
            disabled={submit.isPending || isPreview}
          >
            {isPreview
              ? "Preview mode (submission disabled)"
              : submit.isPending
                ? "Submitting…"
                : "Submit"}
          </Button>
        )}
      </form>
    </div>
  );
}

function FieldInput({
  field,
  register,
  setValue,
  watch,
}: {
  field: PublicField;
  register: ReturnType<typeof useForm>["register"];
  setValue: ReturnType<typeof useForm>["setValue"];
  watch: ReturnType<typeof useForm>["watch"];
}) {
  const id = field.id;

  if (field.type === "long_text") {
    return (
      <Textarea
        className="min-h-[100px]"
        {...register(id, { required: field.required })}
        placeholder={field.placeholder ?? ""}
      />
    );
  }

  if (field.type === "select") {
    return (
      <Select onValueChange={(v) => setValue(id, v)}>
        <SelectTrigger>
          <SelectValue placeholder={field.placeholder ?? "Select…"} />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          checked={Boolean(watch(id))}
          onCheckedChange={(c) => setValue(id, Boolean(c))}
        />
        <span className="text-sm">{field.label}</span>
      </label>
    );
  }

  if (field.type === "rating") {
    return (
      <div className="flex flex-wrap gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            className="p-1 transition-colors hover:scale-110"
            onClick={() => setValue(id, String(n))}
          >
            <Star
              className={cn(
                "size-6",
                watch(id) === String(n)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "number"
        ? "number"
        : field.type === "date"
          ? "date"
          : field.type === "time"
            ? "time"
            : field.type === "url"
              ? "url"
              : "text";

  return (
    <Input
      type={inputType}
      {...register(id, { required: field.required })}
      placeholder={field.placeholder ?? ""}
    />
  );
}
