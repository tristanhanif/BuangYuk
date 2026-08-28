"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, Target, Gift, FlaskConical, Trophy, Landmark, BookOpen } from "lucide-react";
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
    },
    {
      href: "/misi",
      icon: Target,
      label: "Misi",
      desc: "Kerjakan misi harian & mingguan",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      href: "/tukar-poin",
      icon: Gift,
      label: "Tukar Poin",
      desc: "Tukar Eco-Points jadi voucher/hadiah",
      color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    },
    {
      href: "/dampak-hijau",
      icon: FlaskConical,
      label: "Dampak Hijau",
      desc: "Lihat CO₂ & ekuivalensi pohon",
      color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    },
    {
      href: "/leaderboard",
      icon: Trophy,
      label: "Leaderboard",
      desc: "Bersaing jadi juara berkelanjutan",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
      href: "/bank-sampah",
      icon: Landmark,
      label: "Bank Sampah",
      desc: "Temukan titik setor terdekat",
      color: "bg-teal-50 text-teal-600 hover:bg-teal-100",
    },
    {
      href: "/riwayat",
      icon: Search,
      label: "Riwayat",
      desc: "Lihat status transaksi & verifikasi",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      href: "/carbon-tracker",
      icon: TrendingUp,
      label: "Carbon Tracker",
      desc: "Grafik & detail dampak karbonmu",
      color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100",
    },
    {
      href: "/edukasi",
      icon: BookOpen,
      label: "Edukasi & Tips",
      desc: "Artikel & tips daur ulang",
      color: "bg-rose-50 text-rose-600 hover:bg-rose-100",
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
                  "group flex flex-col items-center gap-3 p-4 rounded-xl border border-border transition-all hover:shadow-md text-center",
                  className
                )}
              >
                <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-lg transition-colors", action.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
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
