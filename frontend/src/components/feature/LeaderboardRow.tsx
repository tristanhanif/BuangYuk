"use client";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

export interface LeaderboardRowProps {
  rank: number;
  avatarUrl: string;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
  className?: string;
}

export function LeaderboardRow({
  rank,
  avatarUrl,
  name,
  xp,
  isCurrentUser,
  className,
}: LeaderboardRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3",
        isCurrentUser && "border-primary bg-primary/5",
        className
      )}
    >
      <span
        className={cn(
          "w-6 text-center font-semibold",
          rank <= 3 ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {rank}
      </span>
      <img
        src={avatarUrl}
        alt={`${name} avatar`}
        className="h-10 w-10 rounded-full object-cover"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className={cn("truncate font-medium", isCurrentUser ? "text-primary" : "text-foreground")}>
          {name}
          {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(Kamu)</span>}
        </p>
      </div>
      <span className="text-sm font-semibold text-foreground">{formatNumber(xp)} XP</span>
    </div>
  );
}
