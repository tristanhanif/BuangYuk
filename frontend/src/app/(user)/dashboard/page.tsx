"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { EcoMascot, stageFromXp } from "@/components/feature/EcoMascot";
import { StatWidget } from "@/components/ui/stat-widget";
import { MissionCard } from "@/components/feature/MissionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { missionsMock } from "@/mocks/missionsMock";
import { WASTE_CATEGORIES } from "@/lib/constants";
import { getEcoLevel, getNextLevel, formatNumber, cn } from "@/lib/utils";
import {
  Coins,
  Wallet,
  Leaf,
  Clock,
  Receipt,
  ArrowRight,
  Palette,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PIE_COLORS = [
  "#059669",
  "#10B981",
  "#34D399",
  "#D97706",
  "#0EA5E9",
  "#8B5CF6",
  "#64748B",
  "#F59E0B",
  "#EC4899",
  "#EF4444",
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { ecoSummary, loading: ecoLoading } = useEcoTracker();

  if (authLoading || ecoLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-40 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-56 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-xl" />
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

  const totalPoints = ecoSummary?.totalEcoPoints || 0;
  const co2Total = ecoSummary?.totalCO2Saved || 0;
  const totalTransactions = ecoSummary?.totalTransactions || 0;
  const currentLevel = getEcoLevel(totalPoints);
  const nextLevel = getNextLevel(currentLevel.level);
  const progressToNext = nextLevel
    ? Math.min(100, ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  // Data yang tidak tersedia di EcoSummary → nilai mock demo
  const saldoRapel = 125000;
  const setoranPending = totalTransactions > 0 ? 2 : 0;

  const breakdown = ecoSummary?.wasteBreakdown ?? {};
  const breakdownTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(breakdown)
    .filter(([, weight]) => weight > 0)
    .map(([categoryId, weight], index) => {
      const cat = WASTE_CATEGORIES.find((c) => c.id === categoryId);
      return {
        name: cat?.label ?? categoryId.replace(/-/g, " "),
        value: weight,
        color: PIE_COLORS[index % PIE_COLORS.length],
      };
    });

  const activeMissions = missionsMock
    .filter((m) => m.status !== "claimed")
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Halo, {userName}!
          </h1>
          <p className="text-muted-foreground">Lihat dampak positifmu hari ini</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Total Transaksi:</span>
          <span className="font-semibold text-foreground">{formatNumber(totalTransactions)}</span>
        </div>
      </div>

      {/* EcoMascot widget */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 flex items-center gap-4">
          <EcoMascot stage={stageFromXp(totalPoints)} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Level {currentLevel.level} • {currentLevel.name}</p>
            <p className="mt-1 font-medium text-foreground">
              {formatNumber(totalPoints)} / {formatNumber(nextLevel ? nextLevel.minPoints : totalPoints)} XP
            </p>
            <div className="mt-2 h-3 rounded-full bg-green-200/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <Link href="/profil/level" className="mt-2 inline-block text-xs text-primary hover:underline">
              Lihat detail level
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stat widgets */}
      <div className="grid grid-cols-2 gap-4">
        <StatWidget
          label="Saldo Poin"
          value={formatNumber(totalPoints)}
          unit="Poin"
          icon={<Coins className="h-5 w-5" />}
        />
        <StatWidget
          label="Saldo Rapel Cash"
          value={`Rp${formatNumber(saldoRapel)}`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatWidget
          label="CO₂ Terselamatkan"
          value={co2Total.toFixed(1)}
          unit="kg"
          icon={<Leaf className="h-5 w-5" />}
        />
        <StatWidget
          label="Setoran Pending"
          value={formatNumber(setoranPending)}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatWidget
          label="Total Transaksi"
          value={formatNumber(totalTransactions)}
          icon={<Receipt className="h-5 w-5" />}
        />
        <div className="hidden min-[420px]:flex rounded-xl border border-dashed border-border bg-card p-4 items-center justify-center text-center text-sm text-muted-foreground">
          Teruskan semangat daur ulangmu hari ini!
        </div>
      </div>

      {/* Pie chart statistik sampah */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Statistik Sampahmu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Leaf className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Belum ada data sampah. Mulai setor untuk melihat statistik!</p>
            </div>
          ) : (
            <>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => {
                        const v = Number(value);
                        const pct = breakdownTotal ? ((v / breakdownTotal) * 100).toFixed(1) : 0;
                        return `${v.toFixed(1)} kg (${pct}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {pieData.map((entry, index) => (
                  <span key={index} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick action CTA */}
      <div className="space-y-3">
        <Link
          href="/input-sampah"
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          Setor Sampah Sekarang
        </Link>
        <Link
          href="/dampak-hijau"
          className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
        >
          Lihat Dampak Hijau <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Misi aktif */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Misi Aktif</CardTitle>
            <Link href="/misi" className="text-sm text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMissions.length === 0 ? (
            <EmptyState
              illustration="empty-missions"
              title="Belum ada misi aktif"
              description="Cek misi harian untuk mulai dapat hadiah."
            />
          ) : (
            activeMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                title={mission.title}
                description={mission.description}
                currentProgress={mission.currentProgress}
                targetProgress={mission.targetProgress}
                unit={mission.unit}
                xpReward={mission.xpReward}
                pointsReward={mission.pointsReward}
                status={mission.status}
                deadline={mission.deadline}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
