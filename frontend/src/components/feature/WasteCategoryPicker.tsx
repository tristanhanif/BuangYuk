"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface WasteCategory {
  id: string;
  name: string;
  icon: ReactNode;
  pricePerKg: number;
}

export interface WasteCategoryPickerProps {
  categories: WasteCategory[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function WasteCategoryPicker({
  categories,
  selectedId,
  onSelect,
  className,
}: WasteCategoryPickerProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <span className="text-3xl" aria-hidden="true">{category.icon}</span>
            <span className="text-sm font-medium text-foreground">{category.name}</span>
            <span className="text-xs text-muted-foreground">
              mulai Rp{category.pricePerKg.toLocaleString("id-ID")}/kg
            </span>
          </button>
        );
      })}
    </div>
  );
}
