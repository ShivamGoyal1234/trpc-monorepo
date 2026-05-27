"use client";

import { Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useFormBuilderStore } from "~/src/store/formBuilder.store";

export function FieldConfigPanel({
  onUpdate,
  onDelete,
}: {
  onUpdate: (id: string, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const fields = useFormBuilderStore((s) => s.fields);
  const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId);
  const field = fields.find((f) => f.id === selectedFieldId);

  if (!field) {
    return (
      <div className="flex h-full items-center justify-center border-l p-6 text-sm text-muted-foreground">
        Select a field to configure
      </div>
    );
  }

  const needsOptions = ["select", "multi_select", "checkbox", "ranking"].includes(
    field.type,
  );

  return (
    <div className="flex h-full flex-col border-l">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="text-sm font-semibold">Field settings</h3>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => onDelete(field.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <Label>Label</Label>
            <Input
              className="mt-1"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              className="mt-1"
              value={field.description ?? ""}
              onChange={(e) =>
                onUpdate(field.id, { description: e.target.value || null })
              }
            />
          </div>
          <div>
            <Label>Placeholder</Label>
            <Input
              className="mt-1"
              value={field.placeholder ?? ""}
              onChange={(e) =>
                onUpdate(field.id, { placeholder: e.target.value || null })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Required</Label>
            <Switch
              checked={field.required}
              onCheckedChange={(v) => onUpdate(field.id, { required: v })}
            />
          </div>
          {needsOptions && (
            <div>
              <Label>Options (one per line)</Label>
              <Textarea
                className="mt-1 font-mono text-sm"
                value={(field.options ?? [])
                  .map((o) => o.label)
                  .join("\n")}
                onChange={(e) => {
                  const lines = e.target.value
                    .split("\n")
                    .filter(Boolean);
                  onUpdate(field.id, {
                    options: lines.map((l) => ({
                      value: l.toLowerCase().replace(/\s+/g, "_"),
                      label: l,
                    })),
                  });
                }}
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
