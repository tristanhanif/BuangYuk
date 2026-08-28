"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wallet, Clock, CheckCircle2, ArrowUpRight, TrendingUp, DollarSign, Loader2,
} from "lucide-react";

interface Earning {
  id: string;
  collectorId: string;
  pickupId: string;
  baseFee: number;
  commission: number;
  grossEarnings: number;
  netAvailable: number;
  status: string;
  createdAt: Date;
}

export default function EarningsPage() {
  const { user, loading: authLoading } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const q = query(
      collection(db, "collector_earnings"),
      where("collectorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );      const unsubscribe = onSnapshot(q, (snapshot) => {
      setEarnings(snapshot.docs.map((d) => ({
        id: d.id,
        collectorId: d.data().collectorId || "",
        pickupId: d.data().pickupId || "",
        baseFee: d.data().baseFee || 0,
        commission: d.data().commission || 0,
        grossEarnings: d.data().grossEarnings || 0,
        netAvailable: d.data().netAvailable || 0,
        status: d.data().status || "PENDING",
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      }) as Earning));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return <div className="space-y-6 animate-pulse"><div className="h-8 bg-muted rounded w-1/4" /><div className="h-32 bg-muted rounded-xl" /></div>;
  }

  if (!user) {
    return <div className="text-center py-12"><h1 className="text-2xl font-bold mb-4">Silakan login terlebih dahulu</h1><a href="/login" className="text-primary hover:underline">Login di sini</a></div>;
  }

  const pendingEarnings = earnings.filter((e) => e.status === "PENDING");
  const availableEarnings = earnings.filter((e) => e.status === "AVAILABLE");
  const withdrawnEarnings = earnings.filter((e) => e.status === "WITHDRAWN");

  const totalPending = pendingEarnings.reduce((sum, e) => sum + e.netAvailable, 0);
  const totalAvailable = availableEarnings.reduce((sum, e) => sum + e.netAvailable, 0);
  const totalWithdrawn = withdrawnEarnings.reduce((sum, e) => sum + e.netAvailable, 0);

  const filteredEarnings = filter === "all" ? earnings : earnings.filter((e) => e.status === filter);

  const handleWithdraw = async () => {
    if (!user || totalAvailable <= 0) return;
    setWithdrawing(true);
    try {
      for (const earning of availableEarnings) {
        await updateDoc(doc(db, "collector_earnings", earning.id), {
          status: "WITHDRAWN",
          withdrawnAt: serverTimestamp(),
        });
      }
      // Credit wallet
      const { increment, setDoc: setDocFn } = await import("firebase/firestore");
      await setDocFn(doc(db, "wallets", user.uid), {
        balance: increment(totalAvailable),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch {
      alert("Gagal menarik saldo");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pendapatan</h1>
        <p className="text-muted-foreground">Lihat dan kelola pendapatan pickup</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-xl font-bold text-amber-700">{formatCurrency(totalPending)}</p>
            <p className="text-xs text-amber-600">Pending (24h)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Wallet className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalAvailable)}</p>
            <p className="text-xs text-green-600">Tersedia</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <ArrowUpRight className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-700">{formatCurrency(totalWithdrawn)}</p>
            <p className="text-xs text-blue-600">Withdrawn</p>
          </CardContent>
        </Card>
      </div>

      {totalAvailable > 0 && (
        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleWithdraw} disabled={withdrawing}>
          {withdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
          Tarik Saldo ({formatCurrency(totalAvailable)})
        </Button>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "PENDING", "AVAILABLE", "WITHDRAWN"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "Semua" : f === "PENDING" ? "Pending" : f === "AVAILABLE" ? "Tersedia" : "Withdrawn"}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Riwayat Pendapatan</CardTitle></CardHeader>
        <CardContent>
          {filteredEarnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Belum ada pendapatan</p></div>
          ) : (
            <div className="space-y-3">
              {filteredEarnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Pickup #{earning.pickupId.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(earning.createdAt)}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Base: {formatCurrency(earning.baseFee)}</span>
                      <span className="text-xs text-muted-foreground">Comm: {formatCurrency(earning.commission)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(earning.netAvailable)}</p>
                    <Badge variant={earning.status === "AVAILABLE" ? "success" : earning.status === "PENDING" ? "warning" : "info"} className="text-xs">
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
