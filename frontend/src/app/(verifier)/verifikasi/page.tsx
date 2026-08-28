"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Transaction } from "@/types/transaction";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Filter,
  RefreshCw,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "pending" | "info"; icon: React.ElementType }> = {
  PENDING: { label: "Menunggu", variant: "warning", icon: Clock },
  VERIFIED: { label: "Diverifikasi", variant: "info", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", variant: "destructive", icon: AlertCircle },
  COMPLETED: { label: "Selesai", variant: "success", icon: CheckCircle2 },
};

export default function VerifikasiListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("status", "in", ["PENDING", "VERIFIED", "REJECTED", "COMPLETED"]),
      orderBy("status"),
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

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Silakan login sebagai petugas</h1>
        <a href="/login" className="text-primary hover:underline">Login di sini</a>
      </div>
    );
  }

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Verifikasi</h1>
          <p className="text-muted-foreground">Kelola transaksi yang perlu diverifikasi</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 min-w-[200px] max-w-xs px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="PENDING">Menunggu Verifikasi</option>
              <option value="VERIFIED">Terverifikasi</option>
              <option value="REJECTED">Ditolak</option>
              <option value="COMPLETED">Selesai</option>
              <option value="all">Semua Status</option>
            </select>
            <span className="text-sm text-muted-foreground">
              {filteredTransactions.length} transaksi
            </span>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg mb-2">
              {filter === "PENDING" ? "Tidak ada transaksi menunggu verifikasi" : "Tidak ada transaksi dengan filter ini"}
            </p>
            <p className="text-sm text-muted-foreground">
              Transaksi baru akan muncul di sini secara otomatis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((txn) => {
            const statusConfig = STATUS_CONFIG[txn.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={txn.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link
                    href={`/verifikasi/${txn.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
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
                      {txn.status === "PENDING" && (
                        <Button size="sm" variant="outline" className="ml-2" onClick={() => router.push(`/verifikasi/${txn.id}`)}>
                          Verifikasi
                        </Button>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}