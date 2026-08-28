"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { WASTE_CATEGORIES } from "@/lib/constants";
import {
  Clock, CheckCircle2, XCircle, Truck, Filter, Inbox, MapPin, ExternalLink,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: string; icon: React.ElementType }> = {
  REQUESTED: { label: "Dibuat", variant: "pending", icon: Clock },
  MATCHING: { label: "Matching", variant: "warning", icon: Clock },
  ASSIGNED: { label: "Ditugaskan", variant: "info", icon: Truck },
  ACCEPTED: { label: "Diterima", variant: "info", icon: CheckCircle2 },
  EN_ROUTE: { label: "Dalam Perjalanan", variant: "info", icon: Truck },
  ARRIVED: { label: "Sampai", variant: "info", icon: MapPin },
  VERIFYING: { label: "Verifikasi", variant: "warning", icon: Clock },
  COMPLETED: { label: "Selesai", variant: "success", icon: CheckCircle2 },
  CANCELLED: { label: "Dibatalkan", variant: "destructive", icon: XCircle },
  EXPIRED: { label: "Expired", variant: "destructive", icon: XCircle },
  DISPUTED: { label: "Dispute", variant: "warning", icon: Clock },
  FAILED: { label: "Gagal", variant: "destructive", icon: XCircle },
};

export default function RiwayatPage() {
  const { user, loading: authLoading } = useAuth();
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const q = query(
      collection(db, "pickups"),
      where("customerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPickups(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return <div className="space-y-4 animate-pulse"><div className="h-8 bg-muted rounded w-1/4" />{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}</div>;
  }

  if (!user) {
    return <div className="text-center py-12"><h1 className="text-2xl font-bold mb-4">Silakan login</h1><a href="/login" className="text-primary hover:underline">Login</a></div>;
  }

  const filteredPickups = filter === "all" ? pickups : pickups.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Riwayat Pickup</h1>
          <p className="text-muted-foreground">{pickups.length} pickup tercatat</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="REQUESTED">Dibuat</SelectItem>
              <SelectItem value="MATCHING">Matching</SelectItem>
              <SelectItem value="COMPLETED">Selesai</SelectItem>
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              <SelectItem value="DISPUTED">Dispute</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredPickups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg mb-2">{filter === "all" ? "Belum ada pickup" : "Tidak ada pickup dengan filter ini"}</p>
            <Button asChild><a href="/input-sampah">Setor Sampah Sekarang</a></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPickups.map((pickup) => {
            const statusConfig = STATUS_CONFIG[pickup.status] || STATUS_CONFIG.REQUESTED;
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={pickup.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusConfig.variant as any}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">#{pickup.id.slice(0, 12)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(pickup.createdAt)}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/pickup/${pickup.id}`}>
                        <MapPin className="h-3 w-3 mr-1" />
                        Tracking
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Berat</p>
                      <p className="font-semibold">{(pickup.verifiedWeight || pickup.estimatedWeight || 0).toFixed(1)} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estimasi</p>
                      <p className="font-semibold text-green-600">{formatCurrency(pickup.estimatedValue)}</p>
                    </div>
                    {pickup.finalValue && (
                      <div>
                        <p className="text-xs text-muted-foreground">Final</p>
                        <p className="font-semibold text-green-600">{formatCurrency(pickup.finalValue)}</p>
                      </div>
                    )}
                    {pickup.collectorName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Collector</p>
                        <p className="font-semibold">{pickup.collectorName}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pickup.wasteItems?.map((item: any, idx: number) => {
                      const cat = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
                      return (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                          {cat?.icon} {item.categoryLabel} ({item.weightKg.toFixed(1)} kg)
                        </span>
                      );
                    })}
                  </div>

                  {pickup.proofPhotoUrls && pickup.proofPhotoUrls.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {pickup.proofPhotoUrls.slice(0, 3).map((photo: string, idx: number) => (
                        <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                          <img src={photo} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
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
