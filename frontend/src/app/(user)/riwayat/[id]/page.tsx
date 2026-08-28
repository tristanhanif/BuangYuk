"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/types/transaction";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { WASTE_CATEGORIES } from "@/lib/constants";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, Truck, Wallet, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  COMPLETED: "Selesai",
};

export default function RiwayatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user || !id) {
        setLoading(false);
        return;
      }
      const ref = doc(db, "transactions", id);
      const snap = await getDoc(ref);
      if (active) {
        if (snap.exists()) {
          const data = snap.data();
          setTxn({
            id: snap.id,
            ...data,
            createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
            updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
            verifiedAt: data.verifiedAt ? (data.verifiedAt as { toDate?: () => Date })?.toDate?.() : undefined,
          } as Transaction);
        } else {
          setTxn(null);
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user, id]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-40 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="py-12">
        <EmptyState
          illustration="empty-history"
          title="Transaksi tidak ditemukan"
          description="Transaksi yang kamu cari tidak tersedia atau sudah dihapus."
          actionLabel="Kembali ke Riwayat"
          onAction={() => router.push("/riwayat")}
        />
      </div>
    );
  }

  const timeline = [
    { label: "Diajukan", done: true, time: txn.createdAt },
    { label: "Dijemput", done: txn.status !== "PENDING" && txn.status !== "REJECTED", time: txn.verifiedAt },
    { label: "Dibayar", done: txn.status === "COMPLETED", time: txn.status === "COMPLETED" ? txn.updatedAt : undefined },
    { label: "Selesai", done: txn.status === "COMPLETED", time: txn.status === "COMPLETED" ? txn.updatedAt : undefined },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/riwayat")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Detail Setoran</h1>
              <p className="mt-1 text-xs text-muted-foreground font-mono">#{txn.id.slice(0, 12)}</p>
            </div>
            <Badge variant={txn.status === "REJECTED" ? "destructive" : txn.status === "PENDING" ? "warning" : "success"}>
              {STATUS_LABEL[txn.status] ?? txn.status}
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Berat</p>
              <p className="font-semibold">{txn.totalWeightKg.toFixed(1)} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendapatan</p>
              <p className="font-semibold text-green-600">{formatCurrency(txn.totalEarnings)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CO₂ Saved</p>
              <p className="font-semibold text-blue-600">{txn.totalCO2Saved.toFixed(1)} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Poin</p>
              <p className="font-semibold text-amber-600">+{formatNumber(txn.totalPoints)}</p>
            </div>
          </div>

          {txn.items && (
            <div className="mt-4 flex flex-wrap gap-2">
              {txn.items.map((item, idx) => {
                const cat = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
                const CatIcon = cat?.icon;
                return (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                    {CatIcon && <CatIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />} {cat?.label} ({item.weightKg.toFixed(1)} kg)
                  </span>
                );
              })}
            </div>
          )}

          {txn.rejectionReason && txn.status === "REJECTED" && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <strong>Alasan Penolakan:</strong> {txn.rejectionReason}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold text-foreground mb-5">Perjalanan Setoran</h2>
          <div className="space-y-0">
            {timeline.map((step, idx) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      step.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx === 0 && <Package className="h-4 w-4" />}
                    {idx === 1 && <Truck className="h-4 w-4" />}
                    {idx === 2 && <Wallet className="h-4 w-4" />}
                    {idx === 3 && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className={cn("w-0.5 flex-1 my-1", step.done ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={cn("font-medium", step.done ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                  {step.time && (
                    <p className="text-xs text-muted-foreground">{formatDate(step.time)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Link
        href="/input-sampah"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Setor Sampah Lagi
      </Link>
    </div>
  );
}
