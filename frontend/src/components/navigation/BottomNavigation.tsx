"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Trash2, BarChart3, BookOpen, User, QrCode, ScanLine } from "lucide-react";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/input-sampah", label: "Setor Sampah", icon: Trash2 },
  { href: "/carbon-tracker", label: "Carbon Tracker", icon: BarChart3 },
  { href: "/edukasi", label: "Edukasi", icon: BookOpen },
  { href: "/profil", label: "Profil", icon: User },
];

const verifierNavItems = [
  { href: "/scan", label: "Scan QR", icon: QrCode },
  { href: "/scan", label: "Verifikasi", icon: ScanLine },
];

export function BottomNavigation({ role = "user" }: { role?: "user" | "verifier" }) {
  const pathname = usePathname();
  const navItems = role === "verifier" ? verifierNavItems : userNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-current")} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
