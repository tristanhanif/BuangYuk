"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Trash2,
  Target,
  BarChart3,
  Trophy,
  Gift,
  Bell,
  BookOpen,
  FlaskConical,
  Landmark,
  User,
} from "lucide-react";

const navGroups = [
  {
    label: "Utama",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/input-sampah", label: "Setor Sampah", icon: Trash2 },
      { href: "/carbon-tracker", label: "Carbon Tracker", icon: BarChart3 },
    ],
  },
  {
    label: "Gamifikasi",
    items: [
      { href: "/misi", label: "Misi", icon: Target },
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
      { href: "/tukar-poin", label: "Tukar Poin", icon: Gift },
      { href: "/dampak-hijau", label: "Dampak Hijau", icon: FlaskConical },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { href: "/edukasi", label: "Edukasi", icon: BookOpen },
      { href: "/bank-sampah", label: "Bank Sampah", icon: Landmark },
      { href: "/notifikasi", label: "Notifikasi", icon: Bell },
      { href: "/profil", label: "Profil", icon: User },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 border-r border-border bg-background h-[calc(100vh-4rem)] sticky top-16 flex-col overflow-y-auto">
      <nav className="flex-1 space-y-6 p-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
