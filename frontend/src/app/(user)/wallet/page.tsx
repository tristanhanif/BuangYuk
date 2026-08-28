"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { doc, onSnapshot, collection, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import {
  Wallet as WalletIcon,
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Gift,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [showCashout, setShowCashout] = useState(false);
  const [cashoutSuccess, setCashoutSuccess] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    // Listen to wallet (auto-create if not exists)
    const walletRef = doc(db, "wallets", user.uid);
    const walletUnsub = onSnapshot(walletRef, async (snapshot) => {
      if (snapshot.exists()) {
        setWallet({ id: snapshot.id, ...snapshot.data() });
      } else {
        // Auto-create wallet doc
        try {
          const { setDoc } = await import("firebase/firestore");
          await setDoc(walletRef, {
            userId: user.uid,
            balance: 0,
            ecoPoints: 0,
            cashBalance: 0,
            ecoPointsBalance: 0,
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch {}
      }
      setLoading(false);
    }, () => setLoading(false));

    // Listen to transactions
    const txnQuery = query(
      collection(db, "wallet_transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const txnUnsub = onSnapshot(txnQuery, (snapshot) => {
      setTransactions(snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      })));
    }, () => {});

    return () => { walletUnsub(); txnUnsub(); };
  }, [user]);

  const handleCashout = useCallback(async () => {
    if (!user || !cashoutAmount) return;
    const amount = parseInt(cashoutAmount);
    if (amount < 10000) return;

    try {
      const { addDoc, serverTimestamp, updateDoc, increment } = await import("firebase/firestore");
      
      const walletRef = doc(db, "wallets", user.uid);
      const fee = 1000;
      const netAmount = amount - fee;

      // Deduct balance
      await updateDoc(walletRef, {
        balance: increment(-amount),
        updatedAt: serverTimestamp(),
      });

      // Create cashout request
      await addDoc(collection(db, "cashout_requests"), {
        userId: user.uid,
        amount,
        fee,
        netAmount,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Log transaction
      await addDoc(collection(db, "wallet_transactions"), {
        walletId: user.uid,
        userId: user.uid,
        type: "cashout",
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        description: `Cashout Rp${amount.toLocaleString("id-ID")} (fee Rp${fee.toLocaleString("id-ID")})`,
        status: "completed",
        createdAt: serverTimestamp(),
      });

      setCashoutSuccess(true);
      setShowCashout(false);
      setCashoutAmount("");
      setTimeout(() => setCashoutSuccess(false), 3000);
    } catch {
      alert("Gagal melakukan cashout");
    }
  }, [user, cashoutAmount, wallet]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Silakan login terlebih dahulu</h1>
        <a href="/login" className="text-primary hover:underline">Login di sini</a>
      </div>
    );
  }

  const balance = wallet?.balance || 0;
  const ecoPoints = wallet?.ecoPoints || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Wallet</h1>

      {cashoutSuccess && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Cashout berhasil! Saldo akan diproses dalam 1×24 jam.
        </div>
      )}

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">Saldo Tersedia</p>
              <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <WalletIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => setShowCashout(!showCashout)}
            >
              <DollarSign className="mr-1 h-4 w-4" />
              Cashout
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" asChild>
              <a href="/marketplace">Belanja</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cashout Form */}
      {showCashout && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg">Cashout Saldo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Minimum cashout: Rp 10.000 · Fee: Rp 1.000
            </div>
            <div className="space-y-2">
              <Label htmlFor="cashout-amount">Jumlah Cashout</Label>
              <Input
                id="cashout-amount"
                type="number"
                min="10000"
                step="1000"
                value={cashoutAmount}
                onChange={(e) => setCashoutAmount(e.target.value)}
                placeholder="10000"
              />
            </div>
            {cashoutAmount && parseInt(cashoutAmount) >= 10000 && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                <p>Diterima: <strong>{formatCurrency(parseInt(cashoutAmount) - 1000)}</strong></p>
                <p className="text-xs">Fee cashout: Rp 1.000</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCashout(false)} className="flex-1">Batal</Button>
              <Button
                onClick={handleCashout}
                disabled={!cashoutAmount || parseInt(cashoutAmount) < 10000 || balance < parseInt(cashoutAmount)}
                className="flex-1"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Tarik Saldo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eco Points */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm flex items-center gap-1">
                <Leaf className="h-4 w-4" />
                Eco Points
              </p>
              <p className="text-2xl font-bold text-amber-800">{formatNumber(ecoPoints)}</p>
              <p className="text-xs text-amber-600 mt-1">Tidak dapat dicairkan — gunakan untuk voucher & reward</p>
            </div>
            <Button variant="outline" size="sm" className="border-amber-300" asChild>
              <a href="/eco-redeem">
                <Gift className="mr-1 h-4 w-4" />
                Tukar Poin
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Transaksi Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <WalletIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada transaksi wallet</p>
              <p className="text-sm mt-1">Selesaikan pickup untuk mendapatkan saldo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.type === "credit" ? "bg-green-100 text-green-600" :
                      txn.type === "cashout" ? "bg-amber-100 text-amber-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {txn.type === "credit" ? <ArrowDownRight className="h-5 w-5" /> :
                       txn.type === "cashout" ? <ArrowUpRight className="h-5 w-5" /> :
                       <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(txn.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${txn.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {txn.type === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
                    </p>
                    {txn.balanceAfter !== undefined && (
                      <p className="text-xs text-muted-foreground">Saldo: {formatCurrency(txn.balanceAfter)}</p>
                    )}
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
