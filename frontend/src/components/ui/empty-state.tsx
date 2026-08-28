"use client";

import { cn } from "@/lib/utils";
import { Inbox, Users, ClipboardList, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export type EmptyStateIllustration =
  | "empty-history"
  | "empty-leaderboard"
  | "empty-missions"
  | "empty-notification";

export interface EmptyStateProps {
  illustration?: EmptyStateIllustration;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const ILLUSTRATION_ICON: Record<EmptyStateIllustration, LucideIcon> = {
  "empty-history": Inbox,
  "empty-leaderboard": Users,
  "empty-missions": ClipboardList,
  "empty-notification": BellOff,
};

export function EmptyState({
  illustration = "empty-missions",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const IllustrationIcon = ILLUSTRATION_ICON[illustration];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-14",
        className
      )}
    >
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <IllustrationIcon className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
