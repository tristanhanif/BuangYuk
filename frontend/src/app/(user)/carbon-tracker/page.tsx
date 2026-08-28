"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WASTE_CATEGORIES } from "@/lib/constants";
import { getEcoLevel, getNextLevel } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  BarChart3,
  Trophy,
  TreePine,
  Factory,
  Car,
  Home,
  Info,
  Lock,
  CheckCircle2,
  Leaf,
  Droplet,
  Cpu,
  Globe,
  Recycle,
  Newspaper,
  Flame,
  type LucideIcon,
} from "lucide-react";

const CHART_COLORS = [
  "#059669",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#A855F7",
  "#E11D48",
  "#0EA5E9",
];

const BADGES: { id: string; name: string; desc: string; icon: LucideIcon; requirement: string }[] = [
  { id: "first-deposit", name: "Setor Pertama", desc: "Melakukan setoran sampah pertama", icon: Leaf, requirement: "1 transaksi" },
  { id: "plastic-fighter", name: "Plastic Fighter", desc: "Mengumpulkan 10kg plastik", icon: Droplet, requirement: "10 kg plastik" },
  { id: "e-waste-hero", name: "E-Waste Hero", desc: "Menyetor 5 item e-waste", icon: Cpu, requirement: "5 item e-waste" },
  { id: "carbon-saver", name: "Carbon Saver", desc: "Menyelamatkan 50kg CO₂e", icon: Globe, requirement: "50 kg CO₂e" },
  { id: "eco-warrior", name: "Eco Warrior", desc: "Mencapai Level 3", icon: Recycle, requirement: "Level 3" },
  { id: "tree-planter", name: "Tree Planter", desc: "Setara menanam 10 pohon", icon: TreePine, requirement: "10 pohon setara" },
  { id: "paper-master", name: "Paper Master", desc: "Menyetor 20kg kertas", icon: Newspaper, requirement: "20 kg kertas" },
  { id: "weekly-streak", name: "Weekly Streak", desc: "Setor 4x dalam sebulan", icon: Flame, requirement: "4x/bulan" },
];

export default function CarbonTrackerPage() {
  const { user, loading: authLoading } = useAuth();
  const { ecoSummary, loading: ecoLoading } = useEcoTracker();

  if (authLoading || ecoLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
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

  const totalCO2 = ecoSummary?.totalCO2Saved || 0;
  const totalPoints = ecoSummary?.totalEcoPoints || 0;
  const wasteBreakdown = ecoSummary?.wasteBreakdown || {};
  const monthlyTrend = ecoSummary?.monthlyCO2Trend || [];

  const currentLevel = getEcoLevel(totalPoints);
  const nextLevel = getNextLevel(currentLevel.level);
  const progressToNext = nextLevel
    ? Math.min(100, ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  const pieData = Object.entries(wasteBreakdown)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: WASTE_CATEGORIES.find((c) => c.id === key)?.label || key,
      value,
    }));

  const lineData = monthlyTrend.length > 0
    ? monthlyTrend
    : [{ month: "Blm Ada Data", co2: 0 }];

  const equivalencies = [
    { label: "Pohon Ditanam", value: Math.round(totalCO2 / 21), icon: TreePine, color: "text-green-600", bg: "bg-green-50" },
    { label: "Km Perjalanan Mobil", value: Math.round(totalCO2 / 0.21), icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Hari Listrik Rumah", value: Math.round(totalCO2 / 0.5), icon: Home, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Kg Plastik Baru", value: Math.round(totalCO2 / 2.5), icon: Factory, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Carbon Tracker</h1>
        <p className="text-muted-foreground">Lihat grafik & detail dampak karbonmu</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totalCO2.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO₂e Saved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{formatNumber(totalPoints)}</p>
            <p className="text-xs text-muted-foreground">Eco Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              {<currentLevel.badge className="h-6 w-6" aria-hidden="true" />} Lv.{currentLevel.level}
            </p>
            <p className="text-xs text-muted-foreground">{currentLevel.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{Math.round(totalCO2 / 21)}</p>
            <p className="text-xs text-muted-foreground">Pohon Setara</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {nextLevel && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium flex items-center gap-1.5">
                  {<currentLevel.badge className="h-5 w-5 text-green-600" aria-hidden="true" />}
                  {currentLevel.name}
                </p>
                <p className="text-sm text-muted-foreground">Level saat ini</p>
              </div>
              <div className="text-right">
                <p className="font-medium flex items-center justify-end gap-1.5">
                  {<nextLevel.badge className="h-5 w-5 text-green-600" aria-hidden="true" />}
                  {nextLevel.name}
                </p>
                <p className="text-sm text-muted-foreground">Level berikutnya</p>
              </div>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {formatNumber(totalPoints - currentLevel.minPoints)} / {formatNumber(nextLevel.minPoints - currentLevel.minPoints)} poin
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Distribusi Jenis Sampah
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: unknown) => `${Number(value).toFixed(1)} kg`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada data distribusi sampah</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-primary" />
              Tren Emisi Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: unknown) => `${Number(value).toFixed(1)} kg CO₂e`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="co2"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ fill: "#059669" }}
                    name="CO₂ Saved (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equivalencies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ekivalensi Dampakmu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {equivalencies.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className={`p-4 rounded-xl ${item.bg} text-center`}>
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                  <p className="text-2xl font-bold">{formatNumber(item.value)}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Badge Pencapaian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map((badge) => {
              const unlocked = (ecoSummary?.totalTransactions || 0) > 0;
              const IconComp = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    unlocked
                      ? "border-green-200 bg-green-50"
                      : "border-border bg-muted/50 opacity-60"
                  }`}
                >
                  <div className="relative">
                    <IconComp className="h-8 w-8 mx-auto mb-2 text-emerald-600" strokeWidth={1.5} aria-hidden="true" />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    {unlocked && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">{badge.requirement}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Transparansi Metodologi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="methodology">
              <AccordionTrigger>
                Bagaimana Kami Menghitung Dampakmu?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Perhitungan reduksi emisi karbon menggunakan <strong>metodologi EPA WARM</strong> (Waste Reduction Model) 
                  yang diadaptasi untuk kondisi Indonesia.
                </p>
                <div className="p-4 rounded-lg bg-muted/50 font-mono text-xs">
                  <p>CO₂e Saved = Berat Sampah (kg) × Faktor Emisi (kg CO₂e/kg)</p>
                </div>
                <p>
                  <strong>Faktor Emisi per Kategori:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Kertas & Karton: 3.3 kg CO₂e/kg</li>
                  <li>Plastik PET: 2.5 kg CO₂e/kg</li>
                  <li>Plastik HDPE/PP/LDPE: 1.8 kg CO₂e/kg</li>
                  <li>Aluminium: 8.8 kg CO₂e/kg</li>
                  <li>Besi & Baja: 1.7 kg CO₂e/kg</li>
                  <li>E-Waste Portabel: 1.2 kg CO₂e/pcs</li>
                  <li>CPU: 1.5 kg CO₂e/pcs</li>
                  <li>Baterai: 4.5 kg CO₂e/pcs</li>
                </ul>
                <p>
                  Angka ini merepresentasikan emisi yang <strong>terhindari</strong> dari pembuangan ke TPA 
                  melalui proses daur ulang yang efisien.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
