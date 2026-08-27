"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Leaf, LogOut, User, Settings, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { formatNumber, cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export function Header() {
  const { user, loading: authLoading } = useAuth();
  const { ecoSummary, loading: ecoLoading } = useEcoTracker();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">BuangYuk</span>
          </Link>
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">BuangYuk</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/(auth)/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/(auth)/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const userInitials = user.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/(user)/dashboard" className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl text-foreground hidden sm:block">BuangYuk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/(user)/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/(user)/input-sampah"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Setor Sampah
          </Link>
          <Link
            href="/(user)/carbon-tracker"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Carbon Tracker
          </Link>
          <Link
            href="/(user)/edukasi"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Edukasi
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
            <Wallet className="h-4 w-4" />
            <span>Rp {formatNumber(ecoSummary?.totalEcoPoints || 0)}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback className="text-sm font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || "Pengguna"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/(user)/profil" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/(user)/profil" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Pengaturan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut(auth).then(() => window.location.assign("/"))}
                className="text-red-600 focus:text-red-600 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-background py-4">
          <nav className="flex flex-col gap-2 px-4">
            <Link
              href="/(user)/dashboard"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/(user)/input-sampah"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Setor Sampah
            </Link>
            <Link
              href="/(user)/carbon-tracker"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Carbon Tracker
            </Link>
            <Link
              href="/(user)/edukasi"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Edukasi
            </Link>
            <Link
              href="/(user)/profil"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Profil
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}