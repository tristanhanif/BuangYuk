"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WASTE_CATEGORIES } from "@/lib/constants";
import {
  Warehouse, Package, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, ArrowUpRight, BarChart3, Loader2,
} from "lucide-react";

export default function BankSampahDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [capacity, setCapacity] = useState({ daily: 1000, current: 0 });
  const [incomingPickups, setIncomingPickups] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    // Listen for capacity
    const today = new Date().toISOString().split("T")[0];
    const capUnsub = onSnapshot(doc(db, "bank_capacity", `${user.uid}_${today}`), (snap) => {
      if (snap.exists()) {
        setCapacity({
          daily: snap.data().dailyCapacityKg || 1000,
          current: snap.data().currentLoadKg || 0,
        });
      }
    });

    // Listen for pickups directed to this bank
    const pickupsUnsub = onSnapshot(
      query(
        collection(db, "pickups"),
        where("status", "in", ["VERIFYING", "COMPLETED"]),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        setIncomingPickups(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    // Listen for settlements
    const settlementUnsub = onSnapshot(
      query(
        collection(db, "waste_bank_settlements"),
        where("bankId", "==", user.uid),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        setSettlements(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );

    return () => { capUnsub(); pickupsUnsub(); settlementUnsub(); };
  }, [user]);

  const handleConfirmSettlement = async (settlementId: string) => {
    setConfirming(settlementId);
    try {
      await updateDoc(doc(db, "waste_bank_settlements", settlementId), {
        status: "CONFIRMED",
        confirmedAt: serverTimestamp(),
      });
    } catch {
      alert("Gagal mengkonfirmasi settlement");
    } finally {
      setConfirming(null);
    }
  };

  if (authLoading || loading) {
    return <div className="space-y-6 animate-pulse"><div className="h-8 bg-muted rounded w-1/4" /><div className="h-32 bg-muted rounded-xl" /></div>;
  }

  if (!user) {
    return <div className="text-center py-12"><h1 className="text-2xl font-bold mb-4">Silakan login terlebih dahulu</h1><a href="/login" className="text-primary hover:underline">Login di sini</a></div>;
  }

  const capacityPercent = capacity.daily > 0 ? (capacity.current / capacity.daily) * 100 : 0;
  const isCapacityHigh = capacityPercent > 90;
  const pendingSettlements = settlements.filter((s: any) => s.status === "pending");
  const totalSettlementValue = settlements.reduce((sum: number, s: any) => sum + (s.purchaseValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bank Sampah Dashboard</h1>
          <p className="text-muted-foreground">Kelola supply, kapasitas, dan settlement</p>
        </div>
        <Badge variant={isCapacityHigh ? "destructive" : "success"}>
          {isCapacityHigh ? "⚠️ Hampir Penuh" : "✅ Normal"}
        </Badge>
      </div>

      {/* Capacity */}
      <Card className={isCapacityHigh ? "border-amber-200 bg-amber-50/50" : ""}>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Warehouse className="h-5 w-5 text-primary" /> Kapasitas Hari Ini</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Terisi</span>
            <span className="font-bold">{capacity.current.toLocaleString("id-ID")} / {capacity.daily.toLocaleString("id-ID")} kg</span>
          </div>
          <Progress value={capacityPercent} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">{capacityPercent.toFixed(1)}% terisi</p>
          {isCapacityHigh && (
            <div className="p-3 rounded-lg bg-amber-100 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Kapasitas hampir penuh! Cari fallback partner.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Package className="h-6 w-6 mx-auto text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{incomingPickups.length}</p>
          <p className="text-xs text-muted-foreground">Incoming</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-2" />
          <p className="text-2xl font-bold">{settlements.filter((s: any) => s.status === "CONFIRMED").length}</p>
          <p className="text-xs text-muted-foreground">Dikonfirmasi</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto text-amber-600 mb-2" />
          <p className="text-2xl font-bold">{pendingSettlements.length}</p>
          <p className="text-xs text-muted-foreground">Pending Settlement</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <BarChart3 className="h-6 w-6 mx-auto text-purple-600 mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(totalSettlementValue)}</p>
          <p className="text-xs text-muted-foreground">Total Value</p>
        </CardContent></Card>
      </div>

      {/* Incoming Supply */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Supply Masuk</CardTitle></CardHeader>
        <CardContent>
          {incomingPickups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Belum ada supply masuk</p></div>
          ) : (
            <div className="space-y-3">
              {incomingPickups.slice(0, 5).map((pickup) => (
                <div key={pickup.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{pickup.customerName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{pickup.pickupAddress}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{pickup.verifiedWeight || pickup.estimatedWeight} kg</span>
                      <span className="text-xs font-medium text-green-600">{formatCurrency(pickup.finalValue || pickup.estimatedValue)}</span>
                    </div>
                  </div>
                  <Badge variant={pickup.status === "COMPLETED" ? "success" : "warning"}>{pickup.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Settlement</CardTitle></CardHeader>
        <CardContent>
          {pendingSettlements.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground text-sm">Tidak ada settlement pending</p>
          ) : (
            <div className="space-y-3">
              {pendingSettlements.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Settlement #{s.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{s.materialWeight} kg · {formatCurrency(s.purchaseValue)}</p>
                  </div>
                  <Button size="sm" onClick={() => handleConfirmSettlement(s.id)} disabled={confirming === s.id}>
                    {confirming === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                    Konfirmasi
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
