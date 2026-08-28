"use client";

import { cn } from "@/lib/utils";
import { Lock, type LucideIcon } from "lucide-react";

export interface BadgeIconProps {
  icon: LucideIcon;
  label: string;
  unlocked: boolean;
  size?: "sm" | "lg";
  onClick?: () => void;
  className?: string;
}

export function BadgeIcon({
  icon: Icon,
  label,
  unlocked,
  size = "sm",
  onClick,
  className,
}: BadgeIconProps) {
  const isLg = size === "lg";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={unlocked ? `${label} - terbuka` : `${label} - terkunci`}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isLg ? "h-32" : "h-28",
        unlocked
          ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
          : "border-border bg-muted/40",
        className
      )}
    >
      <Icon
        className={cn(
          isLg ? "h-12 w-12" : "h-10 w-10",
          "text-primary",
          !unlocked && "text-muted-foreground/40 grayscale"
        )}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span
        className={cn(
          "mt-2 text-xs font-medium line-clamp-2",
          unlocked ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      {!unlocked && (
        <span className="absolute bottom-2 right-2 rounded-full bg-foreground/80 p-1">
          <Lock className="h-3 w-3 text-background" />
        </span>
      )}
    </button>
  );
}
