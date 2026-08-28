"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Medal, type LucideIcon } from "lucide-react";

export type EcoLevel = "bronze" | "silver" | "gold";

export interface LevelBadgeProps {
  level: EcoLevel;
  xp: number;
  xpToNextLevel: number | null;
  size?: "sm" | "lg";
  className?: string;
}

const LEVEL_META: Record<
  EcoLevel,
  { name: string; color: string; barColor: string; badge: LucideIcon; range: string }
> = {
  bronze: {
    name: "Bronze Recycler",
    color: "text-[#B08D57]",
    barColor: "bg-[#B08D57]",
    badge: Medal,
    range: "0 – 500 XP",
  },
  silver: {
    name: "Silver Eco-Warrior",
    color: "text-[#8A8A8A]",
    barColor: "bg-[#C0C0C0]",
    badge: Medal,
    range: "501 – 2.000 XP",
  },
  gold: {
    name: "Gold Earth Guardian",
    color: "text-[#B45309]",
    barColor: "bg-[#FBBF24]",
    badge: Medal,
    range: "2.001+ XP",
  },
};

export function LevelBadge({ level, xp, xpToNextLevel, size = "sm", className }: LevelBadgeProps) {
  const meta = LEVEL_META[level];
  const isMax = xpToNextLevel === null || xpToNextLevel <= 0;
  const BadgeIcon = meta.badge;

  const progressPercent = isMax ? 100 : Math.min(100, Math.round((xpTargetProgress(xp, level) / (xpToNextLevel || 1)) * 100));

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        size === "lg" ? "p-6" : "p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BadgeIcon className={cn("h-8 w-8", size === "sm" && "h-7 w-7", meta.color)} aria-hidden="true" />
          <div>
            <p className={cn("font-semibold", meta.color, size === "lg" && "text-lg")}>{meta.name}</p>
            <p className="text-xs text-muted-foreground">{meta.range}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("font-bold text-foreground", size === "lg" && "text-xl")}>{xp.toLocaleString("id-ID")}</p>
          <p className="text-xs text-muted-foreground">
            {isMax ? "Level maksimum" : `${xpToNextLevel?.toLocaleString("id-ID")} XP lagi`}
          </p>
        </div>
      </div>
      <Progress
        value={progressPercent}
        className={cn("mt-4", size === "lg" ? "h-3" : "h-2")}
        indicatorClassName={meta.barColor}
      />
    </div>
  );
}

function xpTargetProgress(xp: number, level: EcoLevel): number {
  // XP di dalam rentang level saat ini
  const base = { bronze: 0, silver: 501, gold: 2001 }[level];
  return xp - base;
}
