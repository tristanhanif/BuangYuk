"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { formatCurrency } from "@/lib/utils";
import { WASTE_CATEGORIES } from "@/lib/constants";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  CheckCircle2,
  Camera,
  Scale,
  Loader2,
  Phone,
  MessageCircle,
} from "lucide-react";

const STATUS_FLOW = ["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "VERIFYING", "COMPLETED"];

export default function CollectorTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const pickupId = params.pickupId as string;
  const { user, loading: authLoading } = useAuth();

  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [verifiedWeight, setVerifiedWeight] = useState("");
  const [distanceToPickup, setDistanceToPickup] = useState<number | null>(null);

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

  // GPS tracking — ref to avoid stale closure
  const pickupRef = useRef(pickup);
  pickupRef.current = pickup;

  useEffect(() => {
    if (!user) return;

    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Update collector location
        updateDoc(doc(db, "collectors", user.uid), {
          currentLat: latitude,
          currentLng: longitude,
          lastLocationUpdate: serverTimestamp(),
        });

        // Calculate distance to pickup using ref for latest data
        const currentPickup = pickupRef.current;
        if (currentPickup?.pickupLocation) {
          const distance = haversineDistance(
            latitude,
            longitude,
            currentPickup.pickupLocation.lat,
            currentPickup.pickupLocation.lng,
          );
          setDistanceToPickup(distance);

          // Auto-arrived if within 100m
          if (distance <= 100 && currentPickup.status === "EN_ROUTE") {
            updateDoc(doc(db, "pickups", pickupId), {
              status: "ARRIVED",
              arrivedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchId) navigator.geolocation?.clearWatch(watchId);
    };
  }, [user, pickupId]);

  const handleAction = useCallback(async (action: string) => {
    if (!pickup || !user) return;
    setIsUpdating(true);

    try {
      const updates: Record<string, any> = { updatedAt: serverTimestamp() };

      switch (action) {
        case "accept":
          updates.status = "ACCEPTED";
          updates.acceptedAt = serverTimestamp();
          break;
        case "en_route":
          updates.status = "EN_ROUTE";
          break;
        case "arrived":
          updates.status = "ARRIVED";
          updates.arrivedAt = serverTimestamp();
          break;
        case "verify":
          updates.status = "VERIFYING";
          updates.verifiedWeight = parseFloat(verifiedWeight);
          updates.verifiedAt = serverTimestamp();
          break;
        case "complete":
          updates.status = "COMPLETED";
          updates.completedAt = serverTimestamp();
          break;
      }

      await updateDoc(doc(db, "pickups", pickupId), updates);
    } catch {
      alert("Gagal memperbarui status");
    } finally {
      setIsUpdating(false);
    }
  }, [pickup, user, pickupId, verifiedWeight]);

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
        <Button onClick={() => router.push("/collector")} className="mt-4">
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(pickup.status);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/collector")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Tracking Pickup</h1>
          <p className="text-sm text-muted-foreground font-mono">#{pickupId.slice(0, 12)}</p>
        </div>
        <Badge variant="info">{pickup.status}</Badge>
      </div>

      {/* Status Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {STATUS_FLOW.map((status, index) => (
              <div key={status} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  index <= currentStatusIndex ? "text-primary" : "text-muted-foreground"
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < currentStatusIndex
                      ? "bg-primary text-primary-foreground"
                      : index === currentStatusIndex
                      ? "bg-primary text-primary-foreground animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {index < currentStatusIndex ? "✓" : index + 1}
                  </div>
                  <span className="text-xs mt-1 whitespace-nowrap">{status}</span>
                </div>
                {index < STATUS_FLOW.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    index < currentStatusIndex ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-lg font-bold text-green-700">
                  {pickup.customerName?.[0] || "C"}
                </span>
              </div>
              <div>
                <p className="font-medium">{pickup.customerName}</p>
                <p className="text-sm text-muted-foreground">{pickup.pickupAddress}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Estimasi</span>
            <span className="font-bold text-green-600">{formatCurrency(pickup.estimatedValue)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Distance Info */}
      {distanceToPickup !== null && (
        <Card className={distanceToPickup <= 100 ? "border-green-200 bg-green-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className={`h-6 w-6 ${distanceToPickup <= 100 ? "text-green-600" : "text-blue-600"}`} />
              <div>
                <p className="font-medium">
                  {distanceToPickup <= 100
                    ? "📍 Sudah Sampai!"
                    : distanceToPickup <= 500
                    ? "🔵 Dekat dengan lokasi"
                    : `📍 ${distanceToPickup.toFixed(0)}m dari lokasi`}
                </p>
                {distanceToPickup <= 100 && (
                  <p className="text-sm text-green-600">Auto-arrived aktif</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form */}
      {pickup.status === "ARRIVED" && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              Input Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Berat Aktual Timbangan (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={verifiedWeight}
                onChange={(e) => setVerifiedWeight(e.target.value)}
                placeholder="0.0"
                className="text-lg"
              />
            </div>
            <Button
              onClick={() => handleAction("verify")}
              disabled={!verifiedWeight || isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Kirim Verifikasi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {pickup.status === "ASSIGNED" && (
          <Button onClick={() => handleAction("accept")} disabled={isUpdating} className="flex-1">
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Terima Pickup
          </Button>
        )}
        {pickup.status === "ACCEPTED" && (
          <Button onClick={() => handleAction("en_route")} disabled={isUpdating} className="flex-1">
            <Navigation className="mr-2 h-4 w-4" />
            Mulai Perjalanan
          </Button>
        )}
        {pickup.status === "VERIFYING" && (
          <Button onClick={() => handleAction("complete")} disabled={isUpdating} className="flex-1 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Selesaikan Pickup
          </Button>
        )}
      </div>
    </div>
  );
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
