"use client";

import { EcoSummary } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { TreePine, Car, Factory, Home, Leaf, Recycle } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface ImpactVisualCardProps {
  ecoSummary: EcoSummary | null;
}

export function ImpactVisualCard({ ecoSummary }: ImpactVisualCardProps) {
  const totalCO2 = ecoSummary?.totalCO2Saved || 0;
  const wasteBreakdown = ecoSummary?.wasteBreakdown || {};

  const equivalents = [
    {
      label: "Pohon Ditanam",
      value: Math.round(totalCO2 / 21),
      icon: TreePine,
      color: "text-green-600",
      bgColor: "bg-green-50",
      desc: "Setara penyerapan CO₂ 21kg/pohon/tahun",
    },
    {
      label: "Jarak Mobil",
      value: Math.round(totalCO2 / 0.21),
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      desc: "Emisi terhindar per km (0.21 kg CO₂/km)",
    },
    {
      label: "Listrik Rumah",
      value: Math.round(totalCO2 / 0.5),
      icon: Home,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      desc: "Hari listrik rumah terhindar (0.5 kg CO₂/hari)",
    },
    {
      label: "Produksi Plastik",
      value: Math.round(totalCO2 / 2.5),
      icon: Factory,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      desc: "Kg plastik baru tidak diproduksi (2.5 kg CO₂/kg)",
    },
  ];

  const topCategories = Object.entries(wasteBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          Ringkasan Dampak Visual
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {equivalents.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className={cn("p-4 rounded-xl border border-border bg-white", item.bgColor)}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn("h-6 w-6", item.color)} />
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(item.value)}</p>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {topCategories.length > 0 && (
          <div className="border-t border-border pt-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Recycle className="h-4 w-4 text-primary" />
              Jenis Sampah Teratas
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {topCategories.map(([category, weight], index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold text-foreground">{weight.toFixed(1)} kg</p>
                  <p className="text-xs text-muted-foreground capitalize">{category.replace(/-/g, " ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {topCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Leaf className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada data dampak. Mulai setor sampah untuk melihat visualisasi!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}