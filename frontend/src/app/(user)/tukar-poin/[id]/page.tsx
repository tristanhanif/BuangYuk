"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productsMock } from "@/mocks/productsMock";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Store, ArrowLeft, Sparkles } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ecoSummary } = useEcoTracker();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justRedeemed, setJustRedeemed] = useState(false);

  const product = productsMock.find((p) => p.id === id);
  const pointsBalance = ecoSummary?.totalEcoPoints ?? 0;

  if (!product) {
    return (
      <div className="py-12">
        <EmptyState
          illustration="empty-history"
          title="Produk tidak ditemukan"
          description="Produk yang kamu cari tidak tersedia."
          actionLabel="Kembali ke Tukar Poin"
          onAction={() => router.push("/tukar-poin")}
        />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const insufficientPoints = pointsBalance < product.pricePoints;

  const handleConfirm = () => {
    setJustRedeemed(true);
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/tukar-poin")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <Card className="overflow-hidden">
        <div className="relative aspect-square w-full bg-muted">
          <img src={product.imageUrl} alt={product.altText} className="h-full w-full object-cover" />
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
              <Badge variant="destructive" className="text-lg px-4 py-1">Stok Habis</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Dibuat oleh {product.sellerName}</span>
            <Badge variant="secondary" className="text-xs">UMKM/SMK Binaan</Badge>
          </div>

          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

          <div className="mt-3 flex items-center gap-4">
            <p className="text-xl font-bold text-foreground">{formatCurrency(product.priceRp)}</p>
            <span className="text-sm font-semibold text-amber-600">
              {formatNumber(product.pricePoints)} Poin
            </span>
          </div>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </CardContent>
      </Card>

      {/* Sticky action */}
      <div className="sticky bottom-20 md:bottom-6 bg-background/95 backdrop-blur p-3 rounded-xl border border-border">
        {insufficientPoints ? (
          <p className="mb-2 text-center text-sm text-red-600">
            Poin kamu belum cukup nih. Kurang {formatNumber(product.pricePoints - pointsBalance)} poin lagi.
          </p>
        ) : (
          <p className="mb-2 text-center text-sm text-muted-foreground">
            Saldo Poin Kamu: <strong>{formatNumber(pointsBalance)}</strong>
          </p>
        )}
        <Button
          className="w-full"
          size="lg"
          disabled={outOfStock || insufficientPoints}
          onClick={() => setConfirmOpen(true)}
        >
          {outOfStock ? "Stok Habis" : "Tukar Sekarang"}
        </Button>
      </div>

      {/* Confirmation modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penukaran</DialogTitle>
            <DialogDescription>Pastikan detail penukaranmu sudah benar.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 mt-2">
            <div className="h-16 w-16 overflow-hidden rounded-lg">
              <img src={product.imageUrl} alt={product.altText} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-medium text-foreground">{product.name}</p>
              <p className="text-sm text-amber-600 font-semibold">{formatNumber(product.pricePoints)} Poin</p>
              <p className="text-xs text-muted-foreground">Saldo: {formatNumber(pointsBalance)} Poin</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
            <Button onClick={handleConfirm}>
              <Sparkles className="mr-2 h-4 w-4" />
              Konfirmasi Penukaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={justRedeemed} onOpenChange={setJustRedeemed}>
        <DialogContent className="text-center sm:max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Sparkles className="h-8 w-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">Penukaran berhasil!</DialogTitle>
            <DialogDescription className="text-center">
              {product.name} sedang diproses. Cek status di Riwayat Penukaran.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => router.push("/tukar-poin")}>Selesai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
