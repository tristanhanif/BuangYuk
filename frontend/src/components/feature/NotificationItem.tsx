"use client";

import { cn } from "@/lib/utils";
import { Truck, Wallet, Gift, Medal } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type NotificationType = "pickup" | "transaction" | "promo" | "badge";

export interface NotificationItemProps {
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  onClick?: () => void;
  className?: string;
}

const TYPE_ICON: Record<NotificationType, { icon: LucideIcon; bg: string; color: string }> = {
  pickup: { icon: Truck, bg: "bg-blue-100", color: "text-blue-600" },
  transaction: { icon: Wallet, bg: "bg-emerald-100", color: "text-emerald-600" },
  promo: { icon: Gift, bg: "bg-amber-100", color: "text-amber-600" },
  badge: { icon: Medal, bg: "bg-purple-100", color: "text-purple-600" },
};

export function NotificationItem({
  type,
  title,
  body,
  timestamp,
  isRead,
  onClick,
  className,
}: NotificationItemProps) {
  const { icon: Icon, bg, color } = TYPE_ICON[type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !isRead && "bg-muted/40",
        className
      )}
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", bg)}>
        <Icon className={cn("h-5 w-5", color)} aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("font-medium", isRead ? "text-muted-foreground" : "text-foreground")}>
            {title}
          </p>
          {!isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(timestamp)}</p>
      </div>
    </button>
  );
}
