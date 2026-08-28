"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { formatDate } from "@/lib/utils";
import {
  AlertTriangle, Scale, DollarSign, Package, Truck, CreditCard,
  MessageCircle, Plus, Clock, CheckCircle2, Loader2,
} from "lucide-react";

const CATEGORIES = [
  { id: "weight", label: "Berat", icon: Scale, color: "bg-blue-100 text-blue-600" },
  { id: "price", label: "Harga", icon: DollarSign, color: "bg-green-100 text-green-600" },
  { id: "material", label: "Material", icon: Package, color: "bg-purple-100 text-purple-600" },
  { id: "condition", label: "Kondisi", icon: AlertTriangle, color: "bg-amber-100 text-amber-600" },
  { id: "pickup", label: "Pickup", icon: Truck, color: "bg-blue-100 text-blue-600" },
  { id: "payment", label: "Pembayaran", icon: CreditCard, color: "bg-red-100 text-red-600" },
  { id: "other", label: "Lainnya", icon: MessageCircle, color: "bg-gray-100 text-gray-600" },
];

const STATUS_CONFIG: Record<string, { label: string; variant: string; icon: any }> = {
  OPEN: { label: "Open", variant: "warning", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", variant: "info", icon: AlertTriangle },
  RESOLVED: { label: "Resolved", variant: "success", icon: CheckCircle2 },
};

export default function DisputesPage() {
  const { user, loading: authLoading } = useAuth();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [pickupId, setPickupId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const q = query(
      collection(db, "disputes"),
      where("createdBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDisputes(snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      })));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [user]);

  const handleCreateDispute = useCallback(async () => {
    if (!user || !selectedCategory || description.length < 10 || !pickupId) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "disputes"), {
        pickupId,
        createdBy: user.uid,
        collectorId: null,
        collectorName: null,
        bankId: null,
        category: selectedCategory,
        description,
        evidencePhotoUrls: [],
        status: "OPEN",
        resolution: null,
        resolutionNotes: null,
        resolvedBy: null,
        resolvedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Log audit
      await addDoc(collection(db, "audit_logs"), {
        actorId: user.uid,
        actorRole: "customer",
        action: "DISPUTE_CREATED",
        entityType: "dispute",
        entityId: "",
        before: null,
        after: { category: selectedCategory, pickupId },
        reason: null,
        timestamp: serverTimestamp(),
        metadata: null,
      });

      setSelectedCategory("");
      setDescription("");
      setPickupId("");
      setShowCreate(false);
    } catch {
      alert("Gagal mengajukan dispute");
    } finally {
      setSubmitting(false);
    }
  }, [user, selectedCategory, description, pickupId]);

  if (authLoading || loading) {
    return <div className="space-y-6 animate-pulse"><div className="h-8 bg-muted rounded w-1/4" /></div>;
  }

  if (!user) {
    return <div className="text-center py-12"><h1 className="text-2xl font-bold mb-4">Silakan login</h1><a href="/login" className="text-primary hover:underline">Login</a></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispute</h1>
          <p className="text-muted-foreground">Ajukan dan lacak dispute transaksi</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showCreate ? "Batal" : "Ajukan Dispute"}
        </Button>
      </div>

      {showCreate && (
        <Card className="border-amber-200">
          <CardHeader><CardTitle className="text-lg">Ajukan Dispute Baru</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pickup ID</Label>
              <Input value={pickupId} onChange={(e) => setPickupId(e.target.value)} placeholder="Masukkan ID pickup (dari Riwayat)" />
            </div>
            <div className="space-y-2">
              <Label>Kategori Dispute</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${selectedCategory === cat.id ? "border-primary bg-green-50" : "border-border hover:border-primary/50"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color} mb-1`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-medium">{cat.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (min. 10 karakter)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan masalah Anda secara detail..."
                className="w-full min-h-[100px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">{description.length}/10 minimum</p>
            </div>
            <Button
              className="w-full"
              onClick={handleCreateDispute}
              disabled={!selectedCategory || description.length < 10 || !pickupId || submitting}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Kirim Dispute
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Riwayat Dispute ({disputes.length})</CardTitle></CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada dispute</p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute) => {
                const statusConfig = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.OPEN;
                const StatusIcon = statusConfig.icon;
                return (
                  <div key={dispute.id} className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusConfig.variant as any}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{dispute.category}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">#{dispute.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-sm">{dispute.description}</p>
                    <p className="text-xs text-muted-foreground">Pickup: #{dispute.pickupId?.slice(0, 8)} · {formatDate(dispute.createdAt)}</p>
                    {dispute.resolution && (
                      <div className="p-2 rounded bg-green-50 border border-green-200 text-sm text-green-700">
                        Resolusi: {String(dispute.resolution).replace(/_/g, " ")}
                        {dispute.resolutionNotes && <p className="text-xs mt-1">{dispute.resolutionNotes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function X(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
