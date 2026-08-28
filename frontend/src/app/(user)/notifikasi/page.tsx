"use client";

import { useState } from "react";
import { NotificationItem } from "@/components/feature/NotificationItem";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { notificationsMock, type AppNotification } from "@/mocks/notificationsMock";

const DAY = 1000 * 60 * 60 * 24;

function groupNotifications(list: AppNotification[]) {
  const now = Date.now();
  const groups: { label: string; items: AppNotification[] }[] = [
    { label: "Hari Ini", items: [] },
    { label: "Minggu Ini", items: [] },
    { label: "Lebih Lama", items: [] },
  ];

  list.slice().forEach((n) => {
    const time = Date.parse(n.timestamp);
    if (now - time < DAY) groups[0].items.push(n);
    else if (now - time < 7 * DAY) groups[1].items.push(n);
    else groups[2].items.push(n);
  });

  return groups.filter((g) => g.items.length > 0);
}

export default function NotifikasiPage() {
  const [items, setItems] = useState<AppNotification[]>(notificationsMock);
  const unreadCount = items.filter((n) => !n.isRead).length;

  const markAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          illustration="empty-notification"
          title="Belum ada notifikasi baru"
          description="Kami akan memberi tahu saat ada aktivitas baru di akunmu."
        />
      </div>
    );
  }

  const groups = groupNotifications(items);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Notifikasi</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={markAll}
          disabled={unreadCount === 0}
        >
          Tandai Semua Dibaca
        </Button>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{group.label}</h2>
          {group.items.map((item) => (
            <NotificationItem
              key={item.id}
              type={item.type}
              title={item.title}
              body={item.body}
              timestamp={item.timestamp}
              isRead={item.isRead}
              onClick={() => toggleRead(item.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
