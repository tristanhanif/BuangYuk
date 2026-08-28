"use client";

import { WasteInputForm } from "@/components/forms/WasteInputForm";
import { Recycle, Sparkles, Trees, HandCoins } from "lucide-react";

export default function InputSampahPage() {
  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Setor & Raih Manfaat
            </span>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              Setor Sampah
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Catat sampahmu dalam 5 langkah mudah, langsung lihat estimasi
              pendapatan & dampak karbon yang kamu hasilkan.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:flex sm:shrink-0 sm:flex-col sm:gap-2">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <HandCoins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">Estimasi</p>
                <p className="text-sm font-semibold">Hasilkan Rupiah</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Trees className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">Dampak</p>
                <p className="text-sm font-semibold">Kurangi CO₂e</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Recycle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">Reward</p>
                <p className="text-sm font-semibold">Kumpulkan Poin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <WasteInputForm />
    </div>
  );
}
