"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { bankSampahMock, RADIUS_OPTIONS } from "@/mocks/bankSampahMock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const BankMap = dynamic(
  () => import("@/components/feature/BankMap").then((mod) => mod.BankMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" />
    ),
  }
);

export default function BankSampahPage() {
  const [radius, setRadius] = useState(5);
  const [centerId, setCenterId] = useState<string | undefined>(undefined);

  const filteredBanks = bankSampahMock
    .filter((bank) => bank.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const focusBank = (id: string) => {
    setCenterId(id);
    document.getElementById(`bank-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const openRoute = (bank: (typeof bankSampahMock)[number]) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bank Sampah</h1>
        <p className="text-muted-foreground mt-1">
          Temukan bank sampah terdekat dan jadwalkan setoranmu
        </p>
      </div>

      {/* Radius filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Radius:</span>
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRadius(opt.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                radius === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <BankMap banks={filteredBanks} centerId={centerId} />

      {/* Bank list */}
      <div className="space-y-4">
        {filteredBanks.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Tidak ada bank sampah dalam radius {radius} km.
          </div>
        ) : (
          filteredBanks.map((bank) => (
            <div
              key={bank.id}
              id={`bank-${bank.id}`}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{bank.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{bank.address}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="whitespace-nowrap">{bank.distanceKm} km</Badge>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {bank.hours}
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => focusBank(bank.id)}>
                  <MapPin className="mr-1 h-4 w-4" />
                  Lihat di Peta
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openRoute(bank)}>
                  <Navigation className="mr-1 h-4 w-4" />
                  Rute
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
