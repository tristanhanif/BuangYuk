"use client";

import { useMemo } from "react";
import { EcoSummary } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Target, TrendingUp, BarChart3, TreePine, Car, Factory, Zap } from "lucide-react";
import { cn, formatNumber, getEcoLevel, getNextLevel, co2Comparator } from "@/lib/utils";
import { ECO_LEVELS } from "@/lib/constants";

interface CarbonTrackerWidgetProps {
  ecoSummary: EcoSummary | null;
}

export function CarbonTrackerWidget({ ecoSummary }: CarbonTrackerWidgetProps) {
  const totalCO2 = ecoSummary?.totalCO2Saved || 0;
  const totalPoints = ecoSummary?.totalEcoPoints || 0;
  const currentLevel = getEcoLevel(totalPoints);
  const nextLevel = getNextLevel(currentLevel.level);

  const progressToNext = nextLevel
    ? Math.min(100, ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  const categoryBreakdown = useMemo(() => {
    const breakdown = ecoSummary?.wasteBreakdown || {};
    return Object.entries(breakdown).map(([categoryId, data]: [string, any]) => ({
      categoryId,
      weightKg: data.weightKg || 0,
      co2Saved: data.co2Saved || 0,
      points: data.points || 0,
      percentage: totalCO2 > 0 ? ((data.co2Saved || 0) / totalCO2) * 100 : 0,
    })).sort((a, b) => b.co2Saved - a.co2Saved);
  }, [ecoSummary, totalCO2]);

  const monthlyTrend = useMemo(() => {
    return ecoSummary?.monthlyCO2Trend || [];
  }, [ecoSummary]);

  const comparators = useMemo(() => co2Comparator(totalCO2), [totalCO2]);

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Leaf className="h-7 w-7" />}
            iconBg="bg-green-100 text-green-600"
            value={totalCO2.toFixed(1)}
            unit="kg CO₂e"
            label="Total CO₂ Terselamatkan"
          />
          <StatCard
            icon={<Award className="h-7 w-7" />}
            iconBg="bg-amber-100 text-amber-600"
            value={formatNumber(totalPoints)}
            unit=""
            label="Eco Points"
          />
          <StatCard
            icon={<Target className="h-7 w-7" />}
            iconBg="bg-blue-100 text-blue-600"
            value={`${currentLevel.badge} Lv.${currentLevel.level}`}
            unit=""
            label={currentLevel.name}
          />
          <StatCard
            icon={<TrendingUp className="h-7 w-7" />}
            iconBg="bg-emerald-100 text-emerald-600"
            value={`${ecoSummary?.totalTransactions || 0}`}
            unit="transaksi"
            label="Total Transaksi"
          />
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress ke {nextLevel.name}</span>
              <span className="font-medium">
                {formatNumber(totalPoints - currentLevel.minPoints)} / {formatNumber(nextLevel.minPoints - currentLevel.minPoints)}
              </span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>
        )}

        {/* Scientific Comparators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ComparatorCard
            icon={<TreePine className="h-5 w-5" />}
            color="text-green-700"
            bg="bg-green-50 border-green-100"
            value={Math.round(totalCO2 / 22)}
            unit="pohon-tahun"
            label="Pohon Ditara"
            description="1 pohon = 22 kg CO₂/th"
          />
          <ComparatorCard
            icon={<Zap className="h-5 w-5" />}
            color="text-yellow-700"
            bg="bg-yellow-50 border-yellow-100"
            value={Math.round(totalCO2 / 2.38)}
            unit="kWh"
            label="Listrik Hemat"
            description="Grid PLN = 2.38 kg CO₂/kWh"
          />
          <ComparatorCard
            icon={<Car className="h-5 w-5" />}
            color="text-blue-700"
            bg="bg-blue-50 border-blue-100"
            value={Math.round(totalCO2 / 2.2)}
            unit="km"
            label="Jarak Mobil"
            description="Mobil bensin = 2.2 kg CO₂/km"
          />
          <ComparatorCard
            icon={<Factory className="h-5 w-5" />}
            color="text-purple-700"
            bg="bg-purple-50 border-purple-100"
            value={(totalCO2 / 1000).toFixed(2)}
            unit="ton"
            label="Ton CO₂e"
            description="Unit standar pelaporan"
          />
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              Breakdown per Kategori (CO₂e)
            </h3>
            <div className="space-y-2">
              {categoryBreakdown.map((item, idx) => (
                <CategoryBreakdownRow key={idx} item={item} totalCO2={totalCO2} />
              ))}
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {monthlyTrend.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Tren Bulanan CO₂e
            </h3>
            <div className="h-32 relative">
              <MonthlyTrendChart data={monthlyTrend} />
            </div>
          </div>
        )}

        {/* Full Comparator Text */}
        <div className="p-3 rounded-lg bg-white/50 border border-green-100 text-xs text-muted-foreground">
          <strong className="text-foreground">Ekivalensi Lengkap: </strong>
          {comparators}
        </div>

        {/* Level Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {ECO_LEVELS.slice(0, currentLevel.level).map((level) => (
            <Badge key={level.level} variant="success" className="text-xs">
              {level.badge} {level.name}
            </Badge>
          ))}
          {ECO_LEVELS.slice(currentLevel.level, currentLevel.level + 1).map((level) => (
            <Badge key={level.level} variant="outline" className="text-xs opacity-50">
              {level.badge} {level.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon, iconBg, value, unit, label }: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  unit: string;
  label: string;
}) {
  return (
    <div className="text-center p-3 rounded-xl bg-white/50 border border-green-100">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${iconBg} mb-2 mx-auto`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}<span className="text-lg font-normal ml-1">{unit}</span></p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ComparatorCard({ icon, color, bg, value, unit, label, description }: {
  icon: React.ReactNode;
  color: string;
  bg: string;
  value: string | number;
  unit: string;
  label: string;
  description: string;
}) {
  return (
    <div className={`p-3 rounded-lg ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`${color}`}>{icon}</span>
        <span className="font-medium text-xs">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}<span className="text-sm font-normal ml-1">{unit}</span></p>
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
  );
}

function CategoryBreakdownRow({ item, totalCO2 }: { item: any; totalCO2: number }) {
  const percentage = totalCO2 > 0 ? ((item.co2Saved / totalCO2) * 100).toFixed(1) : "0";
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-24 flex-shrink-0 text-xs text-muted-foreground truncate">{item.categoryId}</div>
      <div className="flex-1 h-4 bg-green-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
        />
      </div>
      <div className="w-20 text-right font-medium text-green-700">{item.co2Saved.toFixed(1)} kg</div>
      <div className="w-12 text-right text-xs text-muted-foreground">{percentage}%</div>
    </div>
  );
}

function MonthlyTrendChart({ data }: { data: { month: string; co2: number }[] }) {
  const maxCO2 = Math.max(...data.map(d => d.co2), 1);
  const barWidth = 28;
  const gap = 12;
  const chartWidth = data.length * (barWidth + gap);

  return (
    <div className="relative h-full flex items-end justify-center gap-2 px-2" style={{ width: `${chartWidth}px` }}>
      {data.map((d, i) => {
        const heightPercent = (d.co2 / maxCO2) * 100;
        return (
          <div key={i} className="flex flex-col items-center" style={{ width: `${barWidth}px` }}>
            <div
              className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600"
              style={{ height: `${heightPercent}%`, minHeight: d.co2 > 0 ? "4px" : "0" }}
              title={`${d.month}: ${d.co2.toFixed(1)} kg CO₂e`}
            />
            <span className="text-[10px] text-muted-foreground mt-1 truncate w-16 text-center">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}