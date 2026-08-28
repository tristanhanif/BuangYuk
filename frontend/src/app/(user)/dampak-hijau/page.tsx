"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatWidget } from "@/components/ui/stat-widget";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShareCard } from "@/components/feature/ShareCard";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { toPng } from "html-to-image";
import {
  Leaf,
  TreePine,
  Share2,
  Download,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatNumber } from "@/lib/utils";

const TREES_PER_CARD = 5;

export default function DampakHijauPage() {
  const { ecoSummary, loading } = useEcoTracker();
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [chartScope, setChartScope] = useState<"mingguan" | "bulanan">("mingguan");

  const co2Total = ecoSummary?.totalCO2Saved ?? 0;

  const treeCount = Math.round(co2Total / 21);
  const treeProgress = co2Total > 0 ? ((co2Total % 21) / 21) * 100 : 0;

  const treeIcons = useMemo(() => {
    const count = Math.min(treeCount, TREES_PER_CARD);
    return Array.from({ length: count });
  }, [treeCount]);

  const trendData = useMemo(() => {
    if (chartScope === "bulanan") {
      return [
        { period: "Jan", co2Kg: 9 },
        { period: "Feb", co2Kg: 14 },
        { period: "Mar", co2Kg: 20 },
        { period: "Apr", co2Kg: 28 },
        { period: "Mei", co2Kg: 41 },
        { period: "Jun", co2Kg: 63 },
      ];
    }
    return [
      { period: "Minggu 1", co2Kg: 8 },
      { period: "Minggu 2", co2Kg: 12 },
      { period: "Minggu 3", co2Kg: 15 },
      { period: "Minggu 4", co2Kg: 28 },
    ];
  }, [chartScope]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  const shareRefId = "buangyuk-share-card";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const node = document.getElementById(shareRefId);
      if (!node) return;
      const dataUrl = await toPng(node, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "buangyuk-dampak.png";
      link.href = dataUrl;
      link.click();
    } catch {
      // swallow - graceful degradation
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BuangYuk - Dampak Hijau",
          text: `Aku sudah menyelamatkan ${co2Total.toFixed(0)} kg CO₂ setara ${treeCount} pohon! Yuk ikut.`,
        });
      } catch {
        // user cancelled
      }
    }
  };

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dampak Hijau</h1>
        <p className="text-muted-foreground mt-1">Lihat kontribusimu bagi lingkungan secara nyata</p>
      </div>

      {/* CO2 stat */}
      <StatWidget
        label="Total CO₂ Terselamatkan"
        value={co2Total.toFixed(1)}
        unit="kg"
        icon={<Leaf className="h-5 w-5" />}
      />

      {/* Chart with toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tren CO₂ Terselamatkan</CardTitle>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["mingguan", "bulanan"] as const).map((scope) => (
                <button
                  key={scope}
                  onClick={() => setChartScope(scope)}
                  className={
                    chartScope === scope
                      ? "rounded-md bg-background px-3 py-1 text-sm font-medium shadow-sm"
                      : "rounded-md px-3 py-1 text-sm text-muted-foreground"
                  }
                >
                  {scope === "mingguan" ? "Mingguan" : "Bulanan"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value: unknown) => `${Number(value).toFixed(1)} kg CO₂e`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="co2Kg"
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

      {/* Eco-widget pohon */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TreePine className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-foreground">Ekuivalensi Pohon</h2>
          </div>

          {co2Total === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="mb-4">Belum ada CO₂ terselamatkan. Yuk mulai setor sampah!</p>
              <Button onClick={() => router.push("/input-sampah")}>Setor Sampah</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {treeIcons.map((_, i) => (
                    <TreePine key={i} className="h-8 w-8 text-emerald-600" fill="currentColor" />
                  ))}
                  {treeCount > TREES_PER_CARD && (
                    <span className="flex items-center text-sm text-muted-foreground">
                      +{treeCount - TREES_PER_CARD} lagi
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-3 font-medium text-foreground">
                Setara menanam <strong>{treeCount}</strong> pohon dewasa!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(Math.floor(co2Total))} kg CO₂ ÷ 21 kg/pohon
              </p>
              <Progress value={treeProgress} className="mt-3 h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(treeProgress)}% menuju pohon digital berikutnya
              </p>
            </>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Estimasi ekuivalensi pohon berdasarkan rata-rata penyerapan karbon pohon dewasa (sumber:
            EPA GHG Equivalencies), digunakan sebagai ilustrasi dampak, bukan pengukuran ilmiah presisi.
          </p>
        </CardContent>
      </Card>

      {/* Share button */}
      <Button variant="secondary" size="lg" className="w-full" onClick={() => setShareOpen(true)}>
        <Share2 className="mr-2 h-4 w-4" />
        Bagikan ke Media Sosial
      </Button>

      {/* Share card preview */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-sm overflow-y-auto max-h-[90vh]">
          <DialogTitle className="sr-only">Bagikan Dampak</DialogTitle>
          <DialogDescription className="sr-only">
            Pratinjau kartu dampak untuk dibagikan
          </DialogDescription>
          <div className="flex justify-center py-2">
            <ShareCard
              id={shareRefId}
              userName="Rina"
              co2Kg={co2Total}
              treeCount={treeCount}
              mascotStage={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Unduh Gambar
            </Button>
            {canShare && (
              <Button onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Bagikan
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
