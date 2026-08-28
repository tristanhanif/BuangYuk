"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatNumber, formatDate, cn } from "@/lib/utils";
import { Transaction } from "@/types/transaction";
import {
  Wallet,
  Coins,
  Clock,
  ArrowDownToLine,
  Gift,
  Trash2,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Eye,
  Inbox,
  Landmark,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "info" | "pending"; icon: React.ElementType }
> = {
  PENDING: { label: "Menunggu Verifikasi", variant: "warning", icon: Clock },
  VERIFIED: { label: "Terverifikasi", variant: "info", icon: Eye },
  REJECTED: { label: "Ditolak", variant: "destructive", icon: XCircle },
  COMPLETED: { label: "Selesai", variant: "success", icon: CheckCircle2 },
};

function groupByDate(transactions: Transaction[]): Array<{ date: string; items: Transaction[] }> {
  const map = new Map<string, Transaction[]>();
  transactions.forEach((txn) => {
    const key = formatDate(txn.createdAt);
    const list = map.get(key) ?? [];
    list.push(txn);
    map.set(key, list);
  });
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export default function SaldoPage() {
  const { user, loading: authLoading } = useAuth();
  const { ecoSummary, loading: ecoLoading } = useEcoTracker();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
      })) as Transaction[];
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const summary = useMemo(() => {
    const credited = transactions
      .filter((t) => t.status === "VERIFIED" || t.status === "COMPLETED")
      .reduce((sum, t) => sum + (t.verifiedEarnings ?? t.totalEarnings), 0);
    const pending = transactions
      .filter((t) => t.status === "PENDING")
      .reduce((sum, t) => sum + t.totalEarnings, 0);
    const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
    const rejectedCount = transactions.filter((t) => t.status === "REJECTED").length;
    const totalSetor = transactions.length;
    const totalCO2 = ecoSummary?.totalCO2Saved ?? 0;
    return { credited, pending, pendingCount, rejectedCount, totalSetor, totalCO2 };
  }, [transactions, ecoSummary]);

  if (authLoading || ecoLoading || (user && loading)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-muted" />
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

  const userName = user.displayName?.split(" ")[0] || "Pengguna";
  const totalPoints = ecoSummary?.totalEcoPoints ?? 0;
  const grouped = groupByDate(transactions);
  const hasLimitedEarnings = summary.credited > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saldo & Dompet</h1>
          <p className="text-muted-foreground">Kelola saldo dan pantau hasil setoranmu</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <ShieldCheck className="h-4 w-4" />
          Dompet Aman
        </div>
      </div>

      {/* Main wallet card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/70">Saldo Rapel Cash</p>
                <p className="text-lg font-medium text-white/90">Halo, {userName}</p>
              </div>
            </div>
            <Badge className="border-white/20 bg-white/15 text-white">
              <Landmark className="h-3 w-3 mr-1" />
              BuangYuk Wallet
            </Badge>
          </div>

          <p className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {formatCurrency(summary.credited)}
          </p>
          <p className="mt-1 text-sm text-white/75">
            Saldo yang sudah terverifikasi & dapat dicairkan
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/tukar-poin"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "bg-white text-emerald-700 hover:bg-white/90"
              )}
            >
              <Gift className="mr-2 h-4 w-4" />
              Tukar Poin
            </Link>
            <Link
              href="/input-sampah"
              className={cn(buttonVariants({ size: "lg" }), "bg-emerald-700/40 text-white hover:bg-emerald-700/50 border border-white/20 backdrop-blur-sm")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Setor Sampah
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Coins className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{formatNumber(totalPoints)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Saldo Poin</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600">
            <Clock className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{formatCurrency(summary.pending)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.pendingCount} setoran menunggu
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{summary.totalCO2.toFixed(1)} kg</p>
          <p className="mt-1 text-sm text-muted-foreground">CO₂ Terselamatkan</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
            <ArrowDownToLine className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{formatNumber(summary.totalSetor)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Total Setoran</p>
        </div>
      </div>

      {/* Info banner: tarik dana */}
      {hasLimitedEarnings && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Saldo kamu siap dicairkan
              </p>
              <p className="text-sm text-emerald-700">
                {formatCurrency(summary.credited)} sudah terverifikasi dan dapat ditarik ke rekeningmu.
              </p>
            </div>
          </div>
          <button className={cn(buttonVariants({ variant: "success" }), "shrink-0")}>
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Tarik Dana
          </button>
        </div>
      )}

      {/* Transaction ledger */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Wallet className="h-5 w-5 text-primary" />
            Riwayat Saldo
          </h2>
          <Link
            href="/riwayat"
            className="text-sm font-medium text-primary hover:underline"
          >
            Lihat Riwayat Lengkap
          </Link>
        </div>

        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <Inbox className="mx-auto mb-4 h-14 w-14 text-muted-foreground/30" />
            <p className="text-lg font-medium text-foreground">Belum ada transaksi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mulai setor sampah untuk mengisi saldo dan poinmu
            </p>
            <Link
              href="/input-sampah"
              className={cn(buttonVariants(), "mt-5")}
            >
              Setor Sampah Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.date}>
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  {group.date}
                </p>
                <div className="space-y-3">
                  {group.items.map((txn) => {
                    const statusConfig = STATUS_CONFIG[txn.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusConfig.icon;
                    const isCredit = txn.status === "VERIFIED" || txn.status === "COMPLETED";
                    const amount = txn.verifiedEarnings ?? txn.totalEarnings;
                    return (
                      <div
                        key={txn.id}
                        className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                            isCredit
                              ? "bg-emerald-500/10 text-emerald-600"
                              : txn.status === "REJECTED"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-amber-500/10 text-amber-600"
                          )}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {txn.items?.[0]?.categoryLabel || "Setor Sampah"}
                            </p>
                            {txn.items && txn.items.length > 1 && (
                              <span className="shrink-0 text-xs text-muted-foreground">
                                +{txn.items.length - 1} item
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant={statusConfig.variant}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {txn.totalWeightKg.toFixed(1)} kg • #{txn.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              isCredit ? "text-emerald-600" : txn.status === "REJECTED" ? "text-red-500" : "text-muted-foreground"
                            )}
                          >
                            {isCredit ? "+" : ""}
                            {formatCurrency(amount)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            +{formatNumber(txn.verifiedPoints ?? txn.totalPoints)} Poin
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
