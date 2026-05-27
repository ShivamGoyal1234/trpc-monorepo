"use client";

import { create } from "zustand";

import type { FieldType, FormField, FormRecord } from "~/src/types/form";

type FormBuilderState = {
  form: FormRecord | null;
  fields: FormField[];
  selectedFieldId: string | null;
  setForm: (form: FormRecord | null) => void;
  setFields: (fields: FormField[]) => void;
  loadForm: (form: FormRecord, fields: FormField[]) => void;
  selectField: (id: string | null) => void;
  addField: (field: FormField) => void;
  updateField: (id: string, patch: Partial<FormField>) => void;
  removeField: (id: string) => void;
  reorderFields: (orderedIds: string[]) => void;
  updateForm: (patch: Partial<FormRecord>) => void;
};

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  form: null,
  fields: [],
  selectedFieldId: null,

  setForm: (form) => set({ form }),
  setFields: (fields) => set({ fields }),
  loadForm: (form, fields) =>
    set({ form, fields, selectedFieldId: fields[0]?.id ?? null }),
  selectField: (id) => set({ selectedFieldId: id }),

  addField: (field) =>
    set((s) => ({
      fields: [...s.fields, field].sort((a, b) => a.order - b.order),
      selectedFieldId: field.id,
    })),

  updateField: (id, patch) =>
    set((s) => ({
      fields: s.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    })),

  removeField: (id) => {
    const { fields, selectedFieldId } = get();
    const next = fields.filter((f) => f.id !== id);
    set({
      fields: next,
      selectedFieldId:
        selectedFieldId === id ? (next[0]?.id ?? null) : selectedFieldId,
    });
  },

  reorderFields: (orderedIds) => {
    const map = new Map(get().fields.map((f) => [f.id, f]));
    const reordered = orderedIds
      .map((id, index) => {
        const field = map.get(id);
        return field ? { ...field, order: index } : null;
      })
      .filter(Boolean) as FormField[];
    set({ fields: reordered });
  },

  updateForm: (patch) =>
    set((s) => (s.form ? { form: { ...s.form, ...patch } } : {})),
}));

export const FIELD_PALETTE: {
  type: FieldType;
  label: string;
  icon: string;
}[] = [
  { type: "short_text", label: "Short text", icon: "Type" },
  { type: "long_text", label: "Long text", icon: "AlignLeft" },
  { type: "email", label: "Email", icon: "Mail" },
  { type: "number", label: "Number", icon: "Hash" },
  { type: "phone", label: "Phone", icon: "Phone" },
  { type: "url", label: "URL", icon: "Link" },
  { type: "date", label: "Date", icon: "Calendar" },
  { type: "time", label: "Time", icon: "Clock" },
  { type: "select", label: "Dropdown", icon: "ChevronDown" },
  { type: "multi_select", label: "Multi select", icon: "ListChecks" },
  { type: "checkbox", label: "Checkbox", icon: "CheckSquare" },
  { type: "rating", label: "Rating", icon: "Star" },
  { type: "scale", label: "Scale", icon: "SlidersHorizontal" },
  { type: "statement", label: "Statement", icon: "Info" },
];
