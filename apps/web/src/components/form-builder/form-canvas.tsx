"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useFormBuilderStore } from "~/src/store/formBuilder.store";
import type { FormField } from "~/src/types/form";

function SortableField({
  field,
  selected,
  onSelect,
}: {
  field: FormField;
  selected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-card p-4 transition-shadow",
        selected && "ring-2 ring-primary",
        isDragging && "opacity-50 shadow-lg",
      )}
      onClick={onSelect}
    >
      <div className="mb-2 flex items-start gap-2">
        <button
          type="button"
          className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      </div>
      <FieldPreview field={field} />
    </div>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  if (field.type === "statement") {
    return <p className="text-sm text-muted-foreground">{field.label}</p>;
  }
  if (field.type === "long_text") {
    return <Textarea disabled placeholder={field.placeholder ?? ""} />;
  }
  if (["select", "multi_select"].includes(field.type)) {
    return (
      <select disabled className="w-full rounded-md border bg-muted px-3 py-2 text-sm">
        <option>{field.placeholder ?? "Select…"}</option>
      </select>
    );
  }
  if (field.type === "rating") {
    return (
      <div className="flex gap-1 text-2xl text-primary">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>★</span>
        ))}
      </div>
    );
  }
  return (
    <Input
      disabled
      type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
      placeholder={field.placeholder ?? ""}
    />
  );
}

export function FormCanvas({
  onReorder,
}: {
  onReorder: (ids: string[]) => void;
}) {
  const form = useFormBuilderStore((s) => s.form);
  const fields = useFormBuilderStore((s) => s.fields);
  const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId);
  const selectField = useFormBuilderStore((s) => s.selectField);
  const updateForm = useFormBuilderStore((s) => s.updateForm);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    const reordered = [...fields];
    const [removed] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, removed!);
    onReorder(reordered.map((f) => f.id));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b p-4">
        <Input
          className="border-0 text-xl font-bold shadow-none focus-visible:ring-0"
          value={form?.title ?? ""}
          onChange={(e) => updateForm({ title: e.target.value })}
          placeholder="Form title"
        />
        <Textarea
          className="mt-2 resize-none border-0 text-muted-foreground shadow-none focus-visible:ring-0"
          value={form?.description ?? ""}
          onChange={(e) => updateForm({ description: e.target.value })}
          placeholder="Form description"
          rows={2}
        />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mx-auto max-w-xl space-y-3">
              {fields.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                  Add fields from the palette on the left
                </p>
              ) : (
                fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    selected={selectedFieldId === field.id}
                    onSelect={() => selectField(field.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
