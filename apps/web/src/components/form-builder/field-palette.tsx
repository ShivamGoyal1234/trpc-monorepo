"use client";

import * as LucideIcons from "lucide-react";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { FIELD_PALETTE } from "~/src/store/formBuilder.store";
import type { FieldType } from "~/src/types/form";

export function FieldPalette({
  onAdd,
  disabled,
}: {
  onAdd: (type: FieldType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex h-full flex-col border-r bg-muted/20">
      <div className="border-b p-3">
        <h3 className="text-sm font-semibold">Fields</h3>
        <p className="text-xs text-muted-foreground">Click to add</p>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="grid gap-1">
          {FIELD_PALETTE.map((item) => {
            const Icon =
              (
                LucideIcons as unknown as Record<
                  string,
                  React.ComponentType<{ className?: string }>
                >
              )[item.icon] ?? LucideIcons.Circle;
            return (
              <Button
                key={item.type}
                variant="ghost"
                className="h-auto justify-start gap-2 px-3 py-2 text-left"
                disabled={disabled}
                onClick={() => onAdd(item.type)}
              >
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
