"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Trash2, BarChart3, BookOpen, User, QrCode, ScanLine, Wallet, ShoppingBag, Shield, FileText, Settings } from "lucide-react";

const userNavItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/input-sampah", label: "Setor", icon: Trash2 },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/marketplace", label: "Market", icon: ShoppingBag },
  { href: "/profil", label: "Profil", icon: User },
];

const collectorNavItems = [
  { href: "/collector", label: "Dashboard", icon: Home },
  { href: "/collector/earnings", label: "Earnings", icon: Wallet },
  { href: "/riwayat", label: "History", icon: FileText },
  { href: "/carbon-tracker", label: "Stats", icon: BarChart3 },
  { href: "/profil", label: "Profil", icon: User },
];

const verifierNavItems = [
  { href: "/scan", label: "Scan QR", icon: QrCode },
  { href: "/scan", label: "Verifikasi", icon: ScanLine },
];

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/collector", label: "Pickups", icon: FileText },
  { href: "/disputes", label: "Disputes", icon: Shield },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNavigation({ role = "user" }: { role?: "user" | "collector" | "verifier" | "admin" }) {
  const pathname = usePathname();
  let navItems = userNavItems;
  if (role === "collector") navItems = collectorNavItems;
  else if (role === "verifier") navItems = verifierNavItems;
  else if (role === "admin") navItems = adminNavItems;

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
