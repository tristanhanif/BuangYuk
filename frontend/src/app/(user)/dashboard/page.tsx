"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { CarbonTrackerWidget } from "@/components/dashboard/CarbonTrackerWidget";
import { QuickActionGrid } from "@/components/dashboard/QuickActionGrid";
import { ImpactVisualCard } from "@/components/dashboard/ImpactVisualCard";
import { EcoTipsCarousel } from "@/components/dashboard/EcoTipsCarousel";
import { formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { ecoSummary, loading: ecoLoading } = useEcoTracker();

  if (authLoading || ecoLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Silakan login terlebih dahulu</h1>
        <a href="/login" className="text-primary hover:underline">
          Login di sini
        </a>
      </div>
    );
  }

  const userName = user.displayName?.split(" ")[0] || "Pengguna";
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Selamat pagi" : currentHour < 15 ? "Selamat siang" : "Selamat sore";

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}, {userName}!</h1>
          <p className="text-muted-foreground">Lihat dampak positifmu hari ini</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Total Transaksi:</span>
          <span className="font-semibold text-foreground">{formatNumber(ecoSummary?.totalTransactions || 0)}</span>
        </div>
      </div>

      {/* Carbon Tracker Widget */}
      <CarbonTrackerWidget ecoSummary={ecoSummary} />

      {/* Quick Actions */}
      <QuickActionGrid />

      {/* Impact Visual Card */}
      <ImpactVisualCard ecoSummary={ecoSummary} />

      {/* Eco Tips Carousel */}
      <EcoTipsCarousel />
    </div>
  );
}