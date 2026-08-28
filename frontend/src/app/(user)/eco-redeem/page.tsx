"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { doc, onSnapshot, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { formatNumber } from "@/lib/utils";
import { Leaf, Gift, CheckCircle2, Star, Ticket, ShoppingBag } from "lucide-react";

const REWARDS = [
  { id: "voucher-10k", name: "Voucher Rp 10.000", points: 200, icon: Ticket, color: "bg-green-100 text-green-600", description: "Voucher belanja untuk produk daur ulang" },
  { id: "voucher-25k", name: "Voucher Rp 25.000", points: 500, icon: ShoppingBag, color: "bg-blue-100 text-blue-600", description: "Voucher belanja untuk marketplace BuangYuk" },
  { id: "badge-tree", name: "Badge Tree Planter", points: 100, icon: Leaf, color: "bg-emerald-100 text-emerald-600", description: "Badge khusus untuk penyetor aktif" },
  { id: "badge-recycle", name: "Badge Eco Warrior", points: 300, icon: Star, color: "bg-amber-100 text-amber-600", description: "Badge untuk pengelola sampah berprestasi" },
  { id: "free-pickup", name: "Free Pickup 1x", points: 150, icon: Gift, color: "bg-purple-100 text-purple-600", description: "Pickup gratis tanpa biaya transport" },
  { id: "premium-badge", name: "Premium Badge", points: 1000, icon: Star, color: "bg-red-100 text-red-600", description: "Badge eksklusif untuk kontributor teratas" },
];

export default function EcoRedeemPage() {
  const { user, loading: authLoading } = useAuth();
  const [ecoPoints, setEcoPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const walletUnsub = onSnapshot(doc(db, "wallets", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setEcoPoints(snapshot.data().ecoPoints || 0);
      }
      setLoading(false);
    });

    return () => walletUnsub();
  }, [user]);

  const handleRedeem = useCallback(async (rewardId: string, points: number) => {
    if (!user || ecoPoints < points || redeemed.includes(rewardId)) return;

    setRedeeming(rewardId);
    try {
      // Deduct eco points
      await updateDoc(doc(db, "wallets", user.uid), {
        ecoPoints: increment(-points),
        updatedAt: serverTimestamp(),
      });

      // Log redemption
      await addDoc(collection(db, "eco_points"), {
        userId: user.uid,
        points: -points,
        type: "redeemed",
        description: `Redeemed: ${REWARDS.find(r => r.id === rewardId)?.name}`,
        createdAt: serverTimestamp(),
      });

      setRedeemed((prev) => [...prev, rewardId]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      alert("Gagal menukarkan poin");
    } finally {
      setRedeeming(null);
    }
  }, [user, ecoPoints, redeemed]);

  if (authLoading || loading) {
    return <div className="space-y-6 animate-pulse"><div className="h-8 bg-muted rounded w-1/4" /></div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Silakan login terlebih dahulu</h1>
        <a href="/login" className="text-primary hover:underline">Login di sini</a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tukar Eco Points</h1>
        <p className="text-muted-foreground">Tukarkan poinmu dengan voucher dan reward menarik</p>
      </div>

      {showSuccess && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Penukaran berhasil!
        </div>
      )}

      {/* Points Balance */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="p-6 text-center">
          <Leaf className="h-8 w-8 mx-auto text-amber-600 mb-2" />
          <p className="text-3xl font-bold text-amber-800">{formatNumber(ecoPoints)}</p>
          <p className="text-sm text-amber-600">Eco Points Tersedia</p>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REWARDS.map((reward) => {
          const Icon = reward.icon;
          const canRedeem = ecoPoints >= reward.points && !redeemed.includes(reward.id);
          const isRedeemed = redeemed.includes(reward.id);
          const isRedeeming = redeeming === reward.id;

          return (
            <Card key={reward.id} className={`${isRedeemed ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${reward.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        <Leaf className="h-3 w-3 mr-1" />
                        {reward.points} poin
                      </Badge>
                      {isRedeemed ? (
                        <Badge variant="success" className="text-xs">Teredeem ✓</Badge>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!canRedeem || isRedeeming}
                          onClick={() => handleRedeem(reward.id, reward.points)}
                        >
                          {isRedeeming ? "..." : canRedeem ? "Tukar" : "Kurang Poin"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
