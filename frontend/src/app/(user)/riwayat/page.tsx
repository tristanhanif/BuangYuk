"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { WASTE_CATEGORIES } from "@/lib/constants";
import { Transaction } from "@/types/transaction";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Filter,
  Inbox,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "pending" | "info"; icon: React.ElementType }> = {
  PENDING: { label: "Menunggu Verifikasi", variant: "warning", icon: Clock },
  VERIFIED: { label: "Terverifikasi", variant: "info", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", variant: "destructive", icon: XCircle },
  COMPLETED: { label: "Selesai", variant: "success", icon: CheckCircle2 },
};

export default function RiwayatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

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

  if (authLoading || loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
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

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
          <p className="text-muted-foreground">
            {transactions.length} transaksi tercatat
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="PENDING">Menunggu</SelectItem>
              <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
              <SelectItem value="COMPLETED">Selesai</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg mb-2">
              {filter === "all" ? "Belum ada transaksi" : "Tidak ada transaksi dengan filter ini"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Mulai setor sampah untuk melihat riwayat transaksimu
            </p>
            <Button onClick={() => router.push("/input-sampah")}>
              Setor Sampah Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((txn) => {
            const statusConfig = STATUS_CONFIG[txn.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={txn.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusConfig.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {txn.pickupMethod === "pickup" && (
                          <Badge variant="outline">
                            <Truck className="h-3 w-3 mr-1" />
                            Dijemput
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(txn.createdAt)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{txn.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Berat</p>
                      <p className="font-semibold">{txn.totalWeightKg.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pendapatan</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(txn.totalEarnings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                      <p className="font-semibold text-blue-600">
                        {txn.totalCO2Saved.toFixed(1)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Poin</p>
                      <p className="font-semibold text-amber-600">
                        +{formatNumber(txn.totalPoints)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {txn.items?.map((item, idx) => {
                      const cat = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs"
                        >
                          {cat?.icon} {cat?.label} ({item.weightKg.toFixed(1)} kg)
                        </span>
                      );
                    })}
                  </div>

                  {txn.photos && txn.photos.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {txn.photos.slice(0, 3).map((photo, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={photo}
                            alt={`Bukti ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {txn.photos.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          +{txn.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {txn.status === "REJECTED" && txn.rejectionReason && (
                    <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                      <strong>Alasan Penolakan:</strong> {txn.rejectionReason}
                    </div>
                  )}

                  {txn.status === "VERIFIED" && txn.verifiedWeightKg && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                      <strong>Diverifikasi:</strong> {txn.verifiedWeightKg.toFixed(1)} kg 
                      {txn.verifiedWeightKg !== txn.totalWeightKg && (
                        <span className="ml-2">
                          (selisih: {(txn.verifiedWeightKg - txn.totalWeightKg).toFixed(1)} kg)
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
