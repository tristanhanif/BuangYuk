"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { doc, onSnapshot } from "firebase/firestore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WASTE_CATEGORIES } from "@/lib/constants";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  User,
  Package,
  Scale,
  Phone,
  MessageCircle,
} from "lucide-react";

const STATUS_FLOW = ["REQUESTED", "MATCHING", "ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "VERIFYING", "COMPLETED"];

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Permintaan Dibuat",
  MATCHING: "Mencari Collector",
  ASSIGNED: "Collector Ditugaskan",
  ACCEPTED: "Collector Menerima",
  EN_ROUTE: "Collector Dalam Perjalanan",
  ARRIVED: "Collector Sampai",
  VERIFYING: "Verifikasi",
  COMPLETED: "Selesai",
};

export default function PickupTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const pickupId = params.pickupId as string;
  const { user, loading: authLoading } = useAuth();
  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pickupId) return;

    const unsubscribe = onSnapshot(doc(db, "pickups", pickupId), (snapshot) => {
      if (snapshot.exists()) {
        setPickup({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pickupId]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Pickup tidak ditemukan</p>
        <Button onClick={() => router.push("/riwayat")} className="mt-4">Kembali</Button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(pickup.status);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/riwayat")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Tracking Pickup</h1>
          <p className="text-sm text-muted-foreground font-mono">#{pickupId.slice(0, 12)}</p>
        </div>
        <Badge variant="info">{STATUS_LABELS[pickup.status] || pickup.status}</Badge>
      </div>

      {/* Map Placeholder */}
      <Card className="overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <p className="text-sm font-medium text-green-700">Peta Tracking</p>
            <p className="text-xs text-green-600">{pickup.pickupAddress}</p>
          </div>
          {pickup.collectorId && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="success">
                <Navigation className="h-3 w-3 mr-1" />
                Live Tracking
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Status Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {STATUS_FLOW.map((status, index) => (
              <div key={status} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  index <= currentStatusIndex ? "text-primary" : "text-muted-foreground"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < currentStatusIndex
                      ? "bg-primary text-primary-foreground"
                      : index === currentStatusIndex
                      ? "bg-primary text-primary-foreground animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {index < currentStatusIndex ? "✓" : index + 1}
                  </div>
                  <span className="text-[10px] mt-1 whitespace-nowrap">{status}</span>
                </div>
                {index < STATUS_FLOW.length - 1 && (
                  <div className={`w-6 h-0.5 mx-0.5 ${
                    index < currentStatusIndex ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collector Info */}
      {pickup.collectorName && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{pickup.collectorName}</p>
                  <p className="text-sm text-muted-foreground">Collector</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon"><Phone className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><MessageCircle className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pickup Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Pickup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pickup.wasteItems?.map((item: any, idx: number) => {
            const cat = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat?.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{item.categoryLabel}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
                  </div>
                </div>
                <p className="font-medium text-sm">{item.weightKg.toFixed(1)} kg</p>
              </div>
            );
          })}

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimasi Berat</span>
              <span className="font-medium">{pickup.estimatedWeight} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimasi Nilai</span>
              <span className="font-bold text-green-600">{formatCurrency(pickup.estimatedValue)}</span>
            </div>
            {pickup.verifiedWeight && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Berat Terverifikasi</span>
                <span className="font-bold">{pickup.verifiedWeight} kg</span>
              </div>
            )}
            {pickup.finalValue && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nilai Final</span>
                <span className="font-bold text-green-600">{formatCurrency(pickup.finalValue)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pickup.completedAt && (
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Selesai</span>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(pickup.completedAt?.toDate?.() || pickup.completedAt)}</span>
              </div>
            )}
            {pickup.verifiedAt && (
              <div className="flex items-center gap-3 text-sm">
                <Scale className="h-4 w-4 text-amber-600" />
                <span className="text-muted-foreground">Verifikasi</span>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(pickup.verifiedAt?.toDate?.() || pickup.verifiedAt)}</span>
              </div>
            )}
            {pickup.arrivedAt && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-muted-foreground">Collector Sampai</span>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(pickup.arrivedAt?.toDate?.() || pickup.arrivedAt)}</span>
              </div>
            )}
            {pickup.acceptedAt && (
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Diterima Collector</span>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(pickup.acceptedAt?.toDate?.() || pickup.acceptedAt)}</span>
              </div>
            )}
            {pickup.assignedAt && (
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-purple-600" />
                <span className="text-muted-foreground">Collector Ditugaskan</span>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(pickup.assignedAt?.toDate?.() || pickup.assignedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Pickup Dibuat</span>
              <span className="ml-auto text-xs text-muted-foreground">{formatDate(pickup.createdAt?.toDate?.() || pickup.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      {pickup.status === "VERIFYING" && (
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Konfirmasi Hasil Pickup
        </Button>
      )}
    </div>
  );
}
