"use client";

import { EcoMascot, type EcoMascotProps } from "@/components/feature/EcoMascot";

export interface ShareCardProps {
  id?: string;
  userName: string;
  avatarUrl?: string;
  co2Kg: number;
  treeCount: number;
  mascotStage: EcoMascotProps["stage"];
  className?: string;
}

export function ShareCard({ id, userName, avatarUrl, co2Kg, treeCount, mascotStage, className }: ShareCardProps) {
  return (
    <div
      id={id}
      className={`relative flex aspect-[9/16] w-full max-w-sm flex-col items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F4C5C] to-[#0A3745] p-8 text-white ${className ?? ""}`}
    >
      <div className="flex w-full items-center justify-start gap-3">
        {avatarUrl && (
          <img src={avatarUrl} alt={userName} className="h-12 w-12 rounded-full border-2 border-white/30 object-cover" />
        )}
        <span className="font-semibold">{userName}</span>
      </div>

      <div className="flex flex-col items-center">
        <EcoMascot stage={mascotStage} size="lg" />
        <p className="mt-4 text-5xl font-bold">{co2Kg.toLocaleString("id-ID")}</p>
        <p className="text-sm text-white/80">kg CO₂ Terselamatkan</p>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold">Setara {treeCount} Pohon Ditanam</p>
        <p className="mt-1 text-xs text-white/70">Setor sampah, panen manfaat</p>
      </div>
    </div>
  );
}
