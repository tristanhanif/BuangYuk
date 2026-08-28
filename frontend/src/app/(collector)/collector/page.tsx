"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth-guard";
import { db } from "@/lib/firebaseClient";
import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc,
  serverTimestamp, increment, getDocs, limit,
} from "firebase/firestore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WASTE_CATEGORIES } from "@/lib/constants";
import {
  Truck, MapPin, Clock, Wallet, Star, Package,
  Navigation, ArrowRight, Loader2, CheckCircle2,
} from "lucide-react";

interface Pickup {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  wasteItems: Array<{
    categoryId: string;
    categoryLabel: string;
    weightKg: number;
  }>;
  estimatedWeight: number;
  estimatedValue: number;
  pickupAddress: string;
  createdAt: Date;
}

export default function CollectorDashboardPage() {
  return <AuthGuard allowedRoles={["collector"]}><CollectorDashboard /></AuthGuard>;
}

function CollectorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [availableJobs, setAvailableJobs] = useState<Pickup[]>([]);
  const [activePickup, setActivePickup] = useState<Pickup | null>(null);
  const [earnings, setEarnings] = useState({ pending: 0, available: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Listen for available jobs (MATCHING status)
    const jobsQuery = query(
      collection(db, "pickups"),
      where("status", "==", "MATCHING"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })) as Pickup[];
      setAvailableJobs(jobs);
    }, () => {});

    // Listen for active pickup assigned to this collector
    const activeQuery = query(
      collection(db, "pickups"),
      where("collectorId", "==", user.uid),
      where("status", "in", ["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "VERIFYING"])
    );

    const unsubscribeActive = onSnapshot(activeQuery, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const d = snapshot.docs[0];
        setActivePickup({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate() || new Date(),
        } as Pickup);
      } else {
        setActivePickup(null);
      }
    });

    // Listen for collector earnings
    const earningsQuery = query(
      collection(db, "collector_earnings"),
      where("collectorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeEarnings = onSnapshot(earningsQuery, (snapshot) => {
      let pending = 0;
      let available = 0;
      let total = 0;

      snapshot.docs.forEach((d) => {
        const data = d.data();
        const amount = data.amount || 0;
        total += amount;
        if (data.status === "pending") {
          pending += amount;
        } else if (data.status === "available" || data.status === "paid") {
          available += amount;
        }
      });

      setEarnings({ pending, available, total });
      setLoading(false);
    }, () => setLoading(false));

    return () => {
      unsubscribeJobs();
      unsubscribeActive();
      unsubscribeEarnings();
    };
  }, [user]);

  const handleAcceptJob = useCallback(async (pickup: Pickup) => {
    if (!user || accepting) return;
    setAccepting(pickup.id);

    try {
      // Update pickup status to ASSIGNED
      await updateDoc(doc(db, "pickups", pickup.id), {
        status: "ASSIGNED",
        collectorId: user.uid,
        collectorName: user.displayName || "Collector",
        assignedAt: serverTimestamp(),
        acceptanceDeadline: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Log event
      await import("@/lib/firebaseClient").then(async ({ db }) => {
        const { addDoc, collection } = await import("firebase/firestore");
        await addDoc(collection(db, "pickup_events"), {
          pickupId: pickup.id,
          fromStatus: "MATCHING",
          toStatus: "ASSIGNED",
          triggeredBy: user.uid,
          triggerRole: "collector",
          reason: "Collector accepted job",
          timestamp: serverTimestamp(),
        });
      });

      // Navigate to tracking
      router.push(`/collector/tracking/${pickup.id}`);
    } catch {
      alert("Gagal menerima job. Silakan coba lagi.");
    } finally {
      setAccepting(null);
    }
  }, [user, accepting, router]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
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

  const userName = user.displayName?.split(" ")[0] || "Collector";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Halo, {userName}! 🚛</h1>
          <p className="text-muted-foreground">Siap ambil pickup hari ini?</p>
        </div>
        <Badge variant="success" className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Online
        </Badge>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Wallet className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <p className="text-xl font-bold text-green-600">{formatCurrency(earnings.available)}</p>
            <p className="text-xs text-muted-foreground">Tersedia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-xl font-bold text-amber-600">{formatCurrency(earnings.pending)}</p>
            <p className="text-xs text-muted-foreground">Pending (24h)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-600">4.8</p>
            <p className="text-xs text-muted-foreground">Reliability Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Pickup */}
      {activePickup && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              Pickup Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activePickup.customerName}</p>
                <p className="text-sm text-muted-foreground">{activePickup.pickupAddress}</p>
              </div>
              <Badge variant="info">{activePickup.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePickup.wasteItems?.map((item, idx) => {
                const cat = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
                return (
                  <span key={idx} className="text-xs px-2 py-1 rounded-md bg-white border border-green-200">
                    {cat?.icon} {item.categoryLabel} ({item.weightKg.toFixed(1)} kg)
                  </span>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" asChild>
                <a href={`/collector/tracking/${activePickup.id}`}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Buka Tracking
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Job Tersedia ({availableJobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada job tersedia saat ini</p>
              <p className="text-sm">Job baru akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{job.customerName}</p>
                      <Badge variant="outline" className="text-xs">{job.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{job.pickupAddress}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {job.estimatedWeight.toFixed(1)} kg
                      </span>
                      <span className="text-xs font-medium text-green-600">
                        {formatCurrency(job.estimatedValue)}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="ml-3 shrink-0"
                    onClick={() => handleAcceptJob(job)}
                    disabled={accepting === job.id || !!activePickup}
                  >
                    {accepting === job.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        Ambil
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-600">{earnings.total > 0 ? Math.round(earnings.total / 50000) : 0}</p>
              <p className="text-xs text-muted-foreground">Pickup Selesai</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-600">96%</p>
              <p className="text-xs text-muted-foreground">Acceptance Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
