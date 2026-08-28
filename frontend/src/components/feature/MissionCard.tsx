"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, Gift } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export type MissionStatus = "in_progress" | "completed" | "claimed";

export interface MissionCardProps {
  title: string;
  description: string;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  xpReward: number;
  pointsReward: number;
  status: MissionStatus;
  deadline?: string;
  onClaim?: () => void;
  className?: string;
}

export function MissionCard({
  title,
  description,
  currentProgress,
  targetProgress,
  unit,
  xpReward,
  pointsReward,
  status,
  deadline,
  onClaim,
  className,
}: MissionCardProps) {
  const progressPercent = targetProgress > 0
    ? Math.min(100, Math.round((currentProgress / targetProgress) * 100))
    : 0;
  const isClaimed = status === "claimed";
  const isCompleted = status === "completed";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm transition-all",
        isCompleted && "border-primary ring-1 ring-primary/30",
        isClaimed && "opacity-60",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
              isClaimed ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
            )}
          >
            {isClaimed ? <CheckCircle2 className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {isCompleted && (
          <Badge variant="success" className="whitespace-nowrap">Siap Diklaim!</Badge>
        )}
        {isClaimed && (
          <Badge variant="secondary" className="whitespace-nowrap">Sudah Diklaim</Badge>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatNumber(currentProgress)} / {formatNumber(targetProgress)} {unit}
          </span>
          <span className="font-medium text-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {deadline && !isClaimed && (
        <p className="mt-3 text-xs text-muted-foreground">
          {new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Sparkles className="h-3.5 w-3.5" />
            +{formatNumber(xpReward)} XP
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-600">
            +{formatNumber(pointsReward)} Poin
          </span>
        </div>
        <Button
          size="sm"
          variant={isCompleted ? "default" : "outline"}
          disabled={!isCompleted}
          onClick={onClaim}
        >
          {isClaimed ? "Diklaim" : isCompleted ? "Klaim" : "Dalam Proses"}
        </Button>
      </div>
    </div>
  );
}
