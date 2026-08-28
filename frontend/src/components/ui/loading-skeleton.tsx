"use client";

import { cn } from "@/lib/utils";

export interface LoadingSkeletonProps {
  variant: "card" | "list-item" | "chart" | "text-line" | "circle";
  count?: number;
  width?: string;
  height?: string;
  className?: string;
}

export function LoadingSkeleton({
  variant,
  count = 1,
  width,
  height,
  className,
}: LoadingSkeletonProps) {
  const renderItem = (index: number) => {
    const key = `${variant}-${index}`;
    const base = "animate-pulse rounded-md bg-muted";

    switch (variant) {
      case "card":
        return (
          <div
            key={key}
            className={cn(base, "h-32 rounded-xl", className)}
            style={{ width, height }}
          />
        );
      case "list-item":
        return (
          <div
            key={key}
            className={cn(base, "h-16", className)}
            style={{ width, height }}
          />
        );
      case "chart":
        return (
          <div
            key={key}
            className={cn(base, "h-64 w-full", className)}
            style={{ width, height }}
          />
        );
      case "text-line":
        return (
          <div
            key={key}
            className={cn(base, "h-4", className)}
            style={{ width: width ?? "100%", height }}
          />
        );
      case "circle":
        return (
          <div
            key={key}
            className={cn(base, "rounded-full", className)}
            style={{ width: width ?? "3rem", height: height ?? "3rem" }}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "space-y-3",
        variant === "list-item" && "space-y-2",
        variant === "circle" && "flex flex-wrap gap-3 space-y-0"
      )}
    >
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </div>
  );
}
