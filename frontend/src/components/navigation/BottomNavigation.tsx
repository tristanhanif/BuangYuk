"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Plus, Target, Trophy, User, QrCode, ScanLine } from "lucide-react";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/misi", label: "Misi", icon: Target },
  { href: "/input-sampah", label: "Setor Sampah", icon: Plus },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profil", label: "Profil", icon: User },
];

const verifierNavItems = [
  { href: "/scan", label: "Scan QR", icon: QrCode },
  { href: "/scan", label: "Verifikasi", icon: ScanLine },
];

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  className?: string;
}

function NavLink({ href, label, icon: Icon, pathname, className }: NavLinkProps) {
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export function BottomNavigation({ role = "user" }: { role?: "user" | "verifier" }) {
  const pathname = usePathname();
  const isVerifier = role === "verifier";

  if (isVerifier) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex items-center justify-around h-16">
          {verifierNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              pathname={pathname}
            />
          ))}
        </div>
      </nav>
    );
  }

  const regularItems = userNavItems.filter((item) => item.href !== "/input-sampah");
  const center = userNavItems.find((item) => item.href === "/input-sampah");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center h-16">
        {regularItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            pathname={pathname}
          />
        ))}

        {center && (
          <div className="flex flex-1 items-center justify-center -mt-6">
            <Link
              href={center.href}
              aria-label={center.label}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg border-4 border-background transition-transform active:scale-95"
            >
              <Plus className="h-7 w-7" aria-hidden="true" />
            </Link>
          </div>
        )}

        {regularItems.slice(2).map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            pathname={pathname}
          />
        ))}
      </div>
    </nav>
  );
}
