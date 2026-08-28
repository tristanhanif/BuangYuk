"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatWidgetProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: { direction: "up" | "down" | "neutral"; percentage?: number };
  loading?: boolean;
}

export function StatWidget({ label, value, unit, icon, trend, loading }: StatWidgetProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm animate-pulse">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="mt-3 h-6 w-16 bg-muted rounded" />
        <div className="mt-2 h-3 w-24 bg-muted rounded" />
      </div>
    );
  }

  const TrendIcon =
    trend?.direction === "up"
      ? ArrowUpRight
      : trend?.direction === "down"
      ? ArrowDownRight
      : Minus;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up" && "text-green-600",
              trend.direction === "down" && "text-red-600",
              trend.direction === "neutral" && "text-muted-foreground"
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {trend.percentage ? `${trend.percentage}%` : null}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">
        {value as React.ReactNode}
        {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
