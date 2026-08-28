"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { formatCurrency, formatNumber, formatDate, formatRelativeTime } from "@/lib/utils";
import { Transaction } from "@/types/transaction";
import {
  QrCode,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  TrendingUp,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "pending" | "info"; icon: React.ElementType }> = {
  PENDING: { label: "Menunggu", variant: "warning", icon: Clock },
  VERIFIED: { label: "Diverifikasi", variant: "info", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", variant: "destructive", icon: AlertCircle },
  COMPLETED: { label: "Selesai", variant: "success", icon: CheckCircle2 },
};

export default function PetugasDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [verifiedToday, setVerifiedToday] = useState(0);
  const [rejectedToday, setRejectedToday] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("status", "==", "PENDING"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
      })) as Transaction[];

      setRecentTransactions(data);
      setPendingCount(snapshot.size);
      setLoading(false);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayQ = query(
      collection(db, "transactions"),
      where("verifierId", "==", user.uid),
      where("verifiedAt", ">=", today),
      orderBy("verifiedAt", "desc")
    );

    const todayUnsubscribe = onSnapshot(todayQ, (snapshot) => {
      let verified = 0;
      let rejected = 0;
      snapshot.docs.forEach((doc) => {
        const status = doc.data().status;
        if (status === "VERIFIED" || status === "COMPLETED") verified++;
        if (status === "REJECTED") rejected++;
      });
      setVerifiedToday(verified);
      setRejectedToday(rejected);
    });

    return () => {
      unsubscribe();
      todayUnsubscribe();
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Silakan login sebagai petugas</h1>
        <Link href="/login" className="text-primary hover:underline">
          Login di sini
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Petugas</h1>
          <p className="text-muted-foreground">Kelola verifikasi transaksi sampah</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">transaksi PENDING</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-7 w-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diverifikasi Hari Ini</p>
                <p className="text-3xl font-bold text-green-600">{verifiedToday}</p>
                <p className="text-xs text-muted-foreground">transaksi</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak Hari Ini</p>
                <p className="text-3xl font-bold text-red-600">{rejectedToday}</p>
                <p className="text-xs text-muted-foreground">transaksi</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <Link href="/scan" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Scan QR Transaksi</h3>
                  <p className="text-sm text-muted-foreground">Pindai QR atau input ID manual</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-primary font-medium">Mulai verifikasi</span>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Link href="/verifikasi" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Daftar Verifikasi</h3>
                  <p className="text-sm text-muted-foreground">Lihat semua transaksi pending</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-blue-600 font-medium">Lihat daftar</span>
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pending Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transaksi Menunggu Verifikasi</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/verifikasi">
              Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Tidak ada transaksi menunggu verifikasi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => {
                const statusConfig = STATUS_CONFIG[txn.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusConfig.icon;

                return (
                  <Link
                    key={txn.id}
                    href={`/verifikasi/${txn.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <StatusIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{txn.userName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {formatCurrency(txn.totalEarnings)} • {txn.totalWeightKg.toFixed(1)} kg • {formatRelativeTime(txn.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusConfig.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}