"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { WASTE_CATEGORIES } from "@/lib/constants";
import { formatCurrency, formatNumber, formatDate, calculateCO2Saved, calculateEarnings, calculatePoints, validateTransactionItem, validateTotalWeight, co2Comparator, AnomalyFlag } from "@/lib/utils";
import { Transaction } from "@/types/transaction";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  User,
  Calendar,
  Truck,
  Store,
  Loader2,
  Info,
  AlertCircle,
} from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.transactionId as string;
  const { user, loading: authLoading } = useAuth();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualWeight, setActualWeight] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [anomalyFlags, setAnomalyFlags] = useState<{ itemIndex: number; flags: AnomalyFlag[] }[]>([]);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const txnRef = doc(db, "transactions", transactionId);
        const txnSnap = await getDoc(txnRef);

        if (txnSnap.exists()) {
          const data = txnSnap.data();
          setTransaction({
            id: txnSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            verifiedAt: data.verifiedAt?.toDate(),
          } as Transaction);
          setActualWeight(data.totalWeightKg?.toString() || "");
        }
      } catch {
        // Error fetching
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) fetchTransaction();
  }, [transactionId]);

  const handleVerify = async (action: "approve" | "adjust" | "reject") => {
    if (!transaction || !user) return;
    setIsSubmitting(true);

    try {
      const txnRef = doc(db, "transactions", transaction.id);

      if (action === "reject") {
        await updateDoc(txnRef, {
          status: "REJECTED",
          rejectionReason,
          verifierId: user.uid,
          verifierName: user.displayName || "Petugas",
          updatedAt: serverTimestamp(),
          verifiedAt: serverTimestamp(),
        });
        setSuccessMessage("Transaksi berhasil ditolak.");
      } else {
        const weight = parseFloat(actualWeight) || 0;
        const diff = weight - transaction.totalWeightKg;
        const diffPercent = transaction.totalWeightKg > 0 ? Math.abs(diff) / transaction.totalWeightKg * 100 : 0;

        // Recalculate based on verified weight
        let verifiedEarnings = 0;
        let verifiedCO2 = 0;
        let verifiedPoints = 0;

        transaction.items?.forEach((item) => {
          const ratio = transaction.totalWeightKg > 0 ? item.weightKg / transaction.totalWeightKg : 0;
          const itemWeight = weight * ratio;
          verifiedEarnings += calculateEarnings(item.categoryId, itemWeight);
          verifiedCO2 += calculateCO2Saved(item.categoryId, itemWeight);
          verifiedPoints += calculatePoints(item.categoryId, itemWeight);
        });

        const newStatus = action === "adjust" || diffPercent > 10 ? "VERIFIED" : "COMPLETED";

        await updateDoc(txnRef, {
          status: newStatus,
          verifiedWeightKg: weight,
          verifiedEarnings,
          verifiedCO2Saved: verifiedCO2,
          verifiedPoints: Math.round(verifiedPoints),
          verifierId: user.uid,
          verifierName: user.displayName || "Petugas",
          updatedAt: serverTimestamp(),
          verifiedAt: serverTimestamp(),
        });

        setSuccessMessage(
          action === "adjust"
            ? "Data berhasil disesuaikan dan diverifikasi."
            : "Transaksi berhasil disetujui!"
        );
      }
    } catch (err) {
      console.error("Verification error:", err);
      const message = err instanceof Error ? err.message : "Gagal memproses verifikasi. Silakan coba lagi.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computed values & hooks (must be before early returns for Rules of Hooks)
  const verifiedWeight = parseFloat(actualWeight) || 0;
  const weightDiff = transaction?.totalWeightKg ? verifiedWeight - transaction.totalWeightKg : 0;
  const weightDiffPercent = transaction?.totalWeightKg
    ? Math.abs(weightDiff) / transaction.totalWeightKg * 100
    : 0;
  const hasSignificantDiff = weightDiffPercent > 10;

  // Anomaly detection on actual weight input
  useEffect(() => {
    if (!actualWeight || !transaction?.items) {
      setAnomalyFlags([]);
      return;
    }
    const weight = parseFloat(actualWeight);
    if (isNaN(weight) || weight <= 0) {
      setAnomalyFlags([]);
      return;
    }

    const flags = transaction.items.map((item, idx) => ({
      itemIndex: idx,
      flags: validateTransactionItem(item.categoryId, weight * (item.weightKg / (transaction?.totalWeightKg || 1)), item.unit as "kg" | "pcs", item.quantity),
    })).filter(f => f.flags.length > 0);

    const totalFlags = validateTotalWeight(weight);
    if (totalFlags.length > 0) {
      flags.push({ itemIndex: -1, flags: totalFlags });
    }

    setAnomalyFlags(flags);
  }, [actualWeight, transaction?.items, transaction?.totalWeightKg]);

  const recalculated = useMemo(() => {
    if (!transaction) return { earnings: 0, co2: 0, points: 0 };
    let earnings = 0;
    let co2 = 0;
    let points = 0;
    transaction.items?.forEach((item) => {
      const ratio = transaction.totalWeightKg > 0 ? item.weightKg / transaction.totalWeightKg : 0;
      const itemWeight = verifiedWeight * ratio;
      earnings += calculateEarnings(item.categoryId, itemWeight);
      co2 += calculateCO2Saved(item.categoryId, itemWeight);
      points += calculatePoints(item.categoryId, itemWeight);
    });
    return { earnings, co2, points: Math.round(points) };
  }, [transaction, verifiedWeight]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-64 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
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

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Transaksi Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-4">
          ID transaksi &ldquo;{transactionId}&rdquo; tidak ditemukan.
        </p>
        <Button onClick={() => router.push("/scan")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Scanner
        </Button>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="text-center py-12 max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Verifikasi Selesai</h1>
        <p className="text-muted-foreground mb-6">{successMessage}</p>
        <Button onClick={() => router.push("/scan")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Scan Transaksi Lain
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/scan")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verifikasi Transaksi</h1>
          <p className="text-sm text-muted-foreground font-mono">#{transaction.id}</p>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{transaction.userName}</p>
                <p className="text-xs text-muted-foreground">{transaction.userEmail}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={transaction.status === "PENDING" ? "warning" : "info"}>
                {transaction.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                <Calendar className="h-3 w-3" />
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rincian Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transaction.items?.map((item, idx) => {
            const cat = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat?.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{cat?.label || item.categoryLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{item.weightKg.toFixed(2)} kg</p>
                  <p className="text-xs text-green-600">{formatCurrency(item.earnings)}</p>
                </div>
              </div>
            );
          })}

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold">{transaction.totalWeightKg.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kg Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{formatCurrency(transaction.totalEarnings)}</p>
              <p className="text-xs text-muted-foreground">Pendapatan</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{transaction.totalCO2Saved.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kg CO₂e</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pickup Method */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {transaction.pickupMethod === "pickup" ? (
              <Truck className="h-5 w-5 text-blue-600" />
            ) : (
              <Store className="h-5 w-5 text-green-600" />
            )}
            <div>
              <p className="font-medium text-sm">
                {transaction.pickupMethod === "pickup" ? "Dijemput Petugas" : "Antar ke Bank Sampah"}
              </p>
              {transaction.address && (
                <p className="text-xs text-muted-foreground">{transaction.address}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      {transaction.photos && transaction.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bukti Foto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {transaction.photos.map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={photo} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form */}
      {transaction.status === "PENDING" && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              Form Verifikasi Fisik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="actualWeight">Berat Aktual Timbangan (kg)</Label>
              <Input
                id="actualWeight"
                type="number"
                step="0.1"
                min="0"
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                placeholder="0.0"
                className="text-lg"
              />
            </div>

            {actualWeight && (
              <div className={`p-3 rounded-lg text-sm ${
                hasSignificantDiff
                  ? "bg-amber-50 border border-amber-200 text-amber-700"
                  : "bg-green-50 border border-green-200 text-green-700"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {hasSignificantDiff ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <strong>Selisih Berat:</strong>
                </div>
                <p>
                  {weightDiff >= 0 ? "+" : ""}{weightDiff.toFixed(2)} kg ({weightDiffPercent.toFixed(1)}%)
                </p>
                <p className="mt-2 font-medium">Estimasi Ulang:</p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <p className="font-bold">{formatCurrency(recalculated.earnings)}</p>
                    <p className="text-xs">Pendapatan</p>
                  </div>
                  <div>
                    <p className="font-bold">{recalculated.co2.toFixed(1)} kg</p>
                    <p className="text-xs">CO₂e</p>
                  </div>
                  <div>
                    <p className="font-bold">{formatNumber(recalculated.earnings > 0 ? recalculated.points : 0)}</p>
                    <p className="text-xs">Poin</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Catatan / Alasan Penolakan (jika Reject)</Label>
              <textarea
                id="rejectionReason"
                placeholder="Contoh: Berat tidak sesuai, kondisi sampah buruk..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleVerify("reject")}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleVerify("adjust")}
                disabled={isSubmitting || !actualWeight}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Scale className="mr-2 h-4 w-4" />
                    Sesuaikan
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleVerify("approve")}
                disabled={isSubmitting || !actualWeight}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Setujui
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already Verified */}
      {transaction.status !== "PENDING" && transaction.verifiedWeightKg && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-700">Sudah Diverifikasi</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Berat Terverifikasi</p>
                <p className="font-medium">{transaction.verifiedWeightKg.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">Verifikator</p>
                <p className="font-medium">{transaction.verifierName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pendapatan Final</p>
                <p className="font-medium text-green-600">{formatCurrency(transaction.verifiedEarnings || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CO₂ Saved Final</p>
                <p className="font-medium text-blue-600">{(transaction.verifiedCO2Saved || 0).toFixed(1)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason */}
      {transaction.status === "REJECTED" && transaction.rejectionReason && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="font-medium text-red-700">Ditolak</p>
            </div>
            <p className="text-sm text-red-600">{transaction.rejectionReason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
