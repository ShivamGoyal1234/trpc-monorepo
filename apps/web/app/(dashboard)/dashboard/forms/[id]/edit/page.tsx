"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  ExternalLink,
  Eye,
  Loader2,
  MessageSquare,
  MonitorPlay,
  Save,
  Send,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { FieldConfigPanel } from "~/src/components/form-builder/field-config";
import { FieldPalette } from "~/src/components/form-builder/field-palette";
import { FormCanvas } from "~/src/components/form-builder/form-canvas";
import { trpc } from "~/src/lib/trpc";
import { toastTrpcError } from "~/src/lib/trpc-error";
import { useFormBuilderStore } from "~/src/store/formBuilder.store";
import type { FieldType, FormField, FormRecord } from "~/src/types/form";

const DEFAULT_LABELS: Record<FieldType, string> = {
  short_text: "Short answer",
  long_text: "Long answer",
  email: "Email",
  number: "Number",
  phone: "Phone",
  url: "Website",
  date: "Date",
  time: "Time",
  select: "Dropdown",
  multi_select: "Multi select",
  checkbox: "Checkbox",
  rating: "Rating",
  scale: "Scale",
  file: "File upload",
  matrix: "Matrix",
  ranking: "Ranking",
  statement: "Statement",
};

type FormBehaviorSettings = {
  oneQuestionAtATime?: boolean;
  showProgressBar?: boolean;
};

export default function FormEditPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;

  const loadForm = useFormBuilderStore((s) => s.loadForm);
  const form = useFormBuilderStore((s) => s.form);
  const fields = useFormBuilderStore((s) => s.fields);
  const addField = useFormBuilderStore((s) => s.addField);
  const updateField = useFormBuilderStore((s) => s.updateField);
  const updateFormState = useFormBuilderStore((s) => s.updateForm);
  const removeField = useFormBuilderStore((s) => s.removeField);
  const reorderFields = useFormBuilderStore((s) => s.reorderFields);

  const { data, isLoading } = trpc.forms.getById.useQuery({ id: formId });
  const utils = trpc.useUtils();

  useEffect(() => {
    if (data) {
      loadForm(data as unknown as FormRecord, data.fields as FormField[]);
    }
  }, [data, loadForm]);

  const updateForm = trpc.forms.update.useMutation({
    onSuccess: () => toast.success("Form saved"),
    onError: toastTrpcError,
  });

  const createField = trpc.fields.create.useMutation({
    onError: toastTrpcError,
  });

  const updateFieldApi = trpc.fields.update.useMutation({
    onError: toastTrpcError,
  });

  const deleteFieldApi = trpc.fields.delete.useMutation({
    onError: toastTrpcError,
  });

  const reorderApi = trpc.fields.reorder.useMutation({
    onError: toastTrpcError,
  });

  const publish = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published!");
      void utils.forms.getById.invalidate({ id: formId });
    },
    onError: toastTrpcError,
  });

  const handleSave = () => {
    if (!form) return;
    updateForm.mutate({
      id: form.id,
      title: form.title,
      description: form.description ?? undefined,
      visibility: form.visibility,
      settings: form.settings,
    });
  };

  const currentSettings = (form?.settings ?? {}) as FormBehaviorSettings;

  const updateSetting = <K extends keyof FormBehaviorSettings>(
    key: K,
    value: NonNullable<FormBehaviorSettings[K]>,
  ) => {
    if (!form) return;
    updateFormState({
      settings: {
        ...(form.settings ?? {}),
        [key]: value,
      },
    });
  };

  const handleAddField = async (type: FieldType) => {
    const result = await createField.mutateAsync({
      formId,
      type,
      label: DEFAULT_LABELS[type],
      required: false,
    });
    addField(result as FormField);
  };

  const handleUpdateField = (id: string, patch: Record<string, unknown>) => {
    updateField(id, patch as Partial<FormField>);
    updateFieldApi.mutate({ id, ...patch });
  };

  const handleDeleteField = async (id: string) => {
    await deleteFieldApi.mutateAsync({ id });
    removeField(id);
  };

  const handleReorder = async (orderedIds: string[]) => {
    reorderFields(orderedIds);
    const updated = await reorderApi.mutateAsync({ formId, orderedIds });
    if (form) loadForm(form, updated as FormField[]);
  };

  const publicUrl =
    typeof window !== "undefined" && form
      ? `${window.location.origin}/f/${form.slug ?? form.id}`
      : "";

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col -m-4 lg:-m-6">
      <div className="flex flex-wrap items-center gap-2 border-b bg-background px-4 py-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/forms">← Forms</Link>
        </Button>
        <Badge variant="secondary">{form?.status}</Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/responses`}>
              <MessageSquare className="mr-1 size-4" />
              Responses
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/analytics`}>
              <BarChart3 className="mr-1 size-4" />
              Analytics
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/preview`}>
              <MonitorPlay className="mr-1 size-4" />
              Preview
            </Link>
          </Button>
          {form?.status === "published" && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 size-4" />
                  View live
                </a>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-1 size-4" />
                    QR
                  </Button>
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center">
                  <DialogHeader>
                    <DialogTitle>Share form</DialogTitle>
                  </DialogHeader>
                  <QRCodeSVG value={publicUrl} size={200} />
                  <p className="break-all text-center text-xs text-muted-foreground">
                    {publicUrl}
                  </p>
                </DialogContent>
              </Dialog>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={updateForm.isPending}
          >
            <Save className="mr-1 size-4" />
            Save
          </Button>
          {form?.status !== "published" && (
            <Button
              size="sm"
              className=""
              onClick={() => publish.mutate({ id: formId })}
              disabled={publish.isPending || fields.length === 0}
            >
              <Send className="mr-1 size-4" />
              Publish
            </Button>
          )}
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[220px_1fr_280px]">
        <FieldPalette onAdd={handleAddField} disabled={createField.isPending} />
        <div className="flex h-full flex-col overflow-hidden">
          <div className="border-b px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                <div>
                  <Label className="text-sm">One question at a time</Label>
                  <p className="text-xs text-muted-foreground">
                    Convert the public form into step-by-step mode
                  </p>
                </div>
                <Switch
                  checked={Boolean(currentSettings.oneQuestionAtATime)}
                  onCheckedChange={(v) => updateSetting("oneQuestionAtATime", v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                <div>
                  <Label className="text-sm">Show progress bar</Label>
                  <p className="text-xs text-muted-foreground">
                    Display step and completion percentage to respondents
                  </p>
                </div>
                <Switch
                  checked={currentSettings.showProgressBar ?? true}
                  onCheckedChange={(v) => updateSetting("showProgressBar", v)}
                />
              </div>
            </div>
            <Separator className="mt-3" />
          </div>
          <div className="min-h-0 flex-1">
            <FormCanvas onReorder={handleReorder} />
          </div>
        </div>
        <FieldConfigPanel
          onUpdate={handleUpdateField}
          onDelete={handleDeleteField}
        />
      </div>
    </div>
  );
}
