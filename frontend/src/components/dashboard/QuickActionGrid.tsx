"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Gift, TrendingUp, Leaf, Recycle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionGridProps {
  className?: string;
}

export function QuickActionGrid({ className }: QuickActionGridProps) {
  const actions = [
    {
      href: "/input-sampah",
      icon: Plus,
      label: "Setor Sampah",
      desc: "Catat & kirim sampah untuk diverifikasi",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      iconColor: "text-green-600",
    },
    {
      href: "/carbon-tracker",
      icon: TrendingUp,
      label: "Carbon Tracker",
      desc: "Lihat grafik & detail dampak karbonmu",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      href: "/edukasi",
      icon: Leaf,
      label: "Edukasi & Tips",
      desc: "Artikel & tips personalisis daur ulang",
      color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      href: "/eco-redeem",
      icon: Gift,
      label: "Tukar Poin",
      desc: "Tukar Eco-Points jadi voucher/hadiah",
      color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "group flex flex-col items-center gap-3 p-4 rounded-xl border border-border transition-all hover:shadow-md",
                  className
                )}
              >
                <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-lg transition-colors", action.color)}>
                  <Icon className={cn("h-6 w-6", action.iconColor)} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
