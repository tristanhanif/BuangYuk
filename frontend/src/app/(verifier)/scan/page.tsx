"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import {
  QrCode,
  Search,
  ArrowRight,
  Camera,
  Clipboard,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!transactionId.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const txnRef = doc(db, "transactions", transactionId.trim());
      const txnSnap = await getDoc(txnRef);

      if (!txnSnap.exists()) {
        setError("Transaksi tidak ditemukan. Pastikan ID transaksi benar.");
        setIsLoading(false);
        return;
      }

      const txnData = txnSnap.data();
      if (txnData.status === "COMPLETED") {
        setError("Transaksi ini sudah selesai diverifikasi.");
        setIsLoading(false);
        return;
      }

      router.push(`/(verifier)/verifikasi/${transactionId.trim()}`);
    } catch {
      setError("Gagal memeriksa transaksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTransactionId(text.trim());
    } catch {
      // Clipboard access denied
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Silakan login terlebih dahulu</h1>
        <a href="/(auth)/login" className="text-primary hover:underline">
          Login di sini
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Scan QR Transaksi</h1>
        <p className="text-muted-foreground">
          Pindai QR Code atau masukkan ID transaksi secara manual
        </p>
      </div>

      {/* QR Scanner Area */}
      <Card>
        <CardContent className="p-6">
          <div className="relative aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center mb-6">
            <Camera className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground text-center px-4">
              Arahkan kamera ke QR Code transaksi
            </p>
            <Badge variant="outline" className="mt-3">
              <QrCode className="h-3 w-3 mr-1" />
              Scanner Aktif
            </Badge>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Atau masukkan ID secara manual</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionId">ID Transaksi</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="transactionId"
                    placeholder="TXN-xxxxxxxxxx-XXXXXXXXX"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                    className="font-mono text-sm"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handlePaste} title="Tempel dari clipboard">
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleScan}
              disabled={!transactionId.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Cari Transaksi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Transaksi yang baru saja dibuat pengguna akan muncul di sini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
