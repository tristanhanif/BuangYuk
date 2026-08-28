"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWasteCalculator } from "@/hooks/useWasteCalculator";
import { useAuth } from "@/hooks/useAuth";
import { WASTE_CATEGORIES, PICKUP_METHODS, UNIT_CONVERSIONS } from "@/lib/constants";
import { formatCurrency, formatNumber, compressImage, cn, calculateEarnings, calculateCO2Saved, calculatePoints } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Camera,
  Trash2,
  Plus,
  FileImage,
  X,
  Loader2,
  Home,
  Briefcase,
  MapPin,
  PackageCheck,
  PartyPopper,
  Recycle,
  Wallet,
} from "lucide-react";
import { db, storage } from "@/lib/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/components/ui/toast";

const STEPS = ["Pilih Material", "Input Kuantitas", "Estimasi", "Lokasi Pick-up", "Konfirmasi"];

const CATEGORY_GROUPS: { title: string; ids: string[] }[] = [
  { title: "Kertas & Plastik", ids: ["kertas", "plastik-pet", "plastik-hdpe", "plastik-pp", "plastik-ldpe", "plastik-campur"] },
  { title: "Logam & Kaca", ids: ["logam-aluminium", "logam-besi", "logam-kaca"] },
  { title: "Elektronik (E-Waste)", ids: ["e-waste-portabel", "cpu", "layar", "kabel", "baterai"] },
];

interface SavedAddress {
  id: string;
  label: string;
  type: "home" | "office";
  address: string;
  note?: string;
}

const SAVED_ADDRESSES: SavedAddress[] = [
  { id: "addr-1", label: "Rumah", type: "home", address: "Jl. Lingkungan No. 1, Jakarta Timur", note: "Pintu pagar hijau" },
  { id: "addr-2", label: "Kantor", type: "office", address: "Jl. Sudirman Kav. 52-53, Jakarta Selatan" },
];

export function WasteInputForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, addItem, removeItem, clearItems, totals } = useWasteCalculator();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<"kg" | "pcs">("kg");
  const [pickupMethod, setPickupMethod] = useState<"pickup" | "dropoff">("dropoff");
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    weight: number;
    earnings: number;
    points: number;
  } | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(SAVED_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(SAVED_ADDRESSES[0]?.id ?? null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", type: "home" as "home" | "office", address: "", note: "" });

  const selectedCat = WASTE_CATEGORIES.find((c) => c.id === selectedCategory);
  const currentUnit = selectedCat?.unit || "kg";

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    const cat = WASTE_CATEGORIES.find((c) => c.id === categoryId);
    if (cat) setUnit(cat.unit === "pcs" ? "pcs" : "kg");
  }, []);

  const handleAddItem = useCallback(() => {
    if (!selectedCategory || !quantity) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    const cat = WASTE_CATEGORIES.find((c) => c.id === selectedCategory);
    const effectiveUnit = cat?.unit === "pcs" ? "pcs" : unit;

    addItem({
      categoryId: selectedCategory,
      quantity: qty,
      unit: effectiveUnit,
    });

    setSelectedCategory(null);
    setQuantity("");
    setCurrentStep(1);
  }, [selectedCategory, quantity, unit, addItem]);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const compressed = await Promise.all(files.map((f) => compressImage(f)));
    setPhotos((prev) => [...prev, ...compressed].slice(0, 5));
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user || items.length === 0 || !selectedAddress) return;
    setIsSubmitting(true);

    try {
      const address = savedAddresses.find((a) => a.id === selectedAddress);
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const storageRef = ref(storage, `waste-submissions/${user.uid}/${Date.now()}-${photo.name}`);
        await uploadBytes(storageRef, photo);
        const url = await getDownloadURL(storageRef);
        photoUrls.push(url);
      }

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        userName: user.displayName || "Pengguna",
        userEmail: user.email,
        items: items.map((item) => ({
          categoryId: item.categoryId,
          categoryLabel: WASTE_CATEGORIES.find((c) => c.id === item.categoryId)?.label || item.categoryId,
          quantity: item.quantity,
          unit: item.unit,
          weightKg: item.standardizedWeightKg,
          earnings: item.estimatedEarnings,
          co2Saved: item.estimatedCO2Saved,
          points: item.estimatedPoints,
        })),
        pickupMethod,
        location: address
          ? { id: address.id, label: address.label, address: address.address, note: address.note }
          : null,
        photos: photoUrls,
        notes,
        status: "PENDING",
        totalWeightKg: totals.totalWeightKg,
        totalEarnings: totals.totalEarnings,
        totalCO2Saved: totals.totalCO2Saved,
        totalPoints: totals.totalPoints,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSubmitSuccess({
        weight: totals.totalWeightKg,
        earnings: totals.totalEarnings,
        points: totals.totalPoints,
      });
      clearItems();
      setPhotos([]);
      setNotes("");
    } catch {
      toast({
        title: "Gagal mengirim setoran. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, items, photos, pickupMethod, notes, totals, clearItems, router, selectedAddress, savedAddresses]);

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Langkah {currentStep} dari {STEPS.length}
        </span>
        <span className="text-primary">{STEPS[currentStep - 1]}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <Recycle className="h-4 w-4" />
          Pilih Jenis Sampah
        </span>
        <p className="mt-2 text-sm text-muted-foreground">
          Pilih kategori sampah yang ingin kamu setor
        </p>
      </div>

      {CATEGORY_GROUPS.map((group) => (
        <div key={group.title} className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {WASTE_CATEGORIES.filter((c) => group.ids.includes(c.id)).map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    "group relative flex flex-col rounded-2xl border-2 bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                    isSelected
                      ? "border-primary bg-green-50 shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-primary/60"
                  )}
                >
                  <div
                    className={cn(
                      "mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                      cat.color
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold leading-tight text-foreground">{cat.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Satuan: {cat.unit}</p>
                  <span
                    className={cn(
                      "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <PackageCheck className="h-4 w-4 text-primary" />
            Item yang Ditambahkan ({items.length})
          </p>
          <div className="space-y-2">
            {items.map((item, idx) => {
              const itemCategory = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
              const ItemIcon = itemCategory?.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-background px-3 py-2 text-sm"
                >
                  <span className="inline-flex items-center gap-2 font-medium">
                    {ItemIcon && <ItemIcon className="h-4 w-4 text-primary" aria-hidden="true" />}
                    {itemCategory?.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full text-red-500 hover:bg-red-50"
                      onClick={() => removeItem(idx)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => {
    if (!selectedCat) {
      setCurrentStep(1);
      return null;
    }

    const qty = parseFloat(quantity) || 0;
    const stdWeight = qty * UNIT_CONVERSIONS[currentUnit].toKg;
    const previewEarnings = qty > 0 ? calculateEarnings(selectedCat.id, stdWeight) : 0;
    const previewCO2 = qty > 0 ? calculateCO2Saved(selectedCat.id, stdWeight) : 0;
    const previewPoints = qty > 0 ? calculatePoints(selectedCat.id, stdWeight) : 0;

    return (
      <div className="space-y-6">
        <div className="text-center mb-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            {<selectedCat.icon className="h-4 w-4" aria-hidden="true" />} {selectedCat.label}
          </span>
          <h2 className="mt-3 text-xl font-semibold">Input Kuantitas</h2>
          <p className="text-sm text-muted-foreground">Masukkan jumlah sampah yang ingin kamu setor</p>
        </div>

        <Card className="border-primary/20 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Kuantitas</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="flex-1 pr-12 text-lg font-semibold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      {unit}
                    </span>
                  </div>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setUnit("kg")}
                      className={cn(
                        "px-4 py-2 text-sm font-semibold transition-colors",
                        unit === "kg"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      kg
                    </button>
                    <button
                      onClick={() => setUnit("pcs")}
                      className={cn(
                        "px-4 py-2 text-sm font-semibold transition-colors",
                        unit === "pcs"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      pcs
                    </button>
                  </div>
                </div>
              </div>

              {qty > 0 ? (
                <div className="rounded-xl bg-slate-50 border border-border p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Estimasi untuk setoran ini
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-green-50 px-2 py-3">
                      <p className="text-lg font-bold text-green-700">{formatCurrency(previewEarnings)}</p>
                      <p className="text-[11px] text-green-600">Pendapatan</p>
                    </div>
                    <div className="rounded-lg bg-teal-50 px-2 py-3">
                      <p className="text-lg font-bold text-teal-700">{previewCO2.toFixed(1)} kg</p>
                      <p className="text-[11px] text-teal-600">CO₂e Saved</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 px-2 py-3">
                      <p className="text-lg font-bold text-amber-700">{formatNumber(previewPoints)}</p>
                      <p className="text-[11px] text-amber-600">Poin</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Bobot ternormalisasi: <strong>{stdWeight.toFixed(2)} kg</strong>
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border text-sm text-muted-foreground text-center">
                  Masukkan jumlah untuk melihat estimasi pendapatan & dampak karbon
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 py-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button
            onClick={handleAddItem}
            disabled={!quantity || parseFloat(quantity) <= 0}
            className="flex-1 py-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Item
          </Button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-600">
          <Wallet className="h-4 w-4" />
          Estimasi Setoran
        </span>
        <h2 className="mt-3 text-xl font-semibold">Ringkasan Setoranmu</h2>
        <p className="text-sm text-muted-foreground">Ini estimasi pendapatan & dampak karbon yang kamu hasilkan</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center">
          <Trash2 className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-medium text-muted-foreground">Belum ada item yang ditambahkan.</p>
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="mt-4">
            Kembali ke Pilih Material
          </Button>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white shadow-md">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-white/85">Total Estimasi</p>
              <Badge className="bg-white/15 text-white border-white/20">Draft</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totals.totalEarnings)}</p>
                <p className="mt-1 text-[11px] text-white/75">Pendapatan</p>
              </div>
              <div className="border-x border-white/15">
                <p className="text-2xl font-bold">{totals.totalCO2Saved.toFixed(1)} kg</p>
                <p className="mt-1 text-[11px] text-white/75">CO₂e Saved</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totals.totalPoints)}</p>
                <p className="mt-1 text-[11px] text-white/75">Poin Reward</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm">
              <span className="text-white/85">Total Berat</span>
              <span className="font-semibold">{totals.totalWeightKg.toFixed(2)} kg</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <PackageCheck className="h-4 w-4 text-primary" />
              Rincian Item ({items.length})
            </p>
            {items.map((item, idx) => {
              const cat = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
              const CatIcon = cat?.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 text-sm shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {CatIcon && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <CatIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{cat?.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} → {item.standardizedWeightKg.toFixed(2)} kg
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(item.estimatedEarnings)}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.estimatedCO2Saved.toFixed(1)} kg CO₂e
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 py-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
            <Button onClick={() => setCurrentStep(4)} className="flex-1 py-6">
              Lanjut Lokasi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderStep4Lokasi = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <MapPin className="h-4 w-4" />
          Lokasi Pick-up
        </span>
        <h2 className="mt-3 text-xl font-semibold">Di mana sampah dijemput?</h2>
        <p className="text-sm text-muted-foreground">Pilih alamat pengambilan sampahmu</p>
      </div>

      <div className="space-y-3">
        {savedAddresses.map((addr) => (
          <button
            key={addr.id}
            onClick={() => setSelectedAddress(addr.id)}
            className={cn(
              "w-full rounded-2xl border-2 bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
              selectedAddress === addr.id
                ? "border-primary bg-green-50 shadow-md ring-2 ring-primary/20"
                : "border-border hover:border-primary/60"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                selectedAddress === addr.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {addr.type === "home" ? <Home className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold flex items-center gap-2">
                  {addr.label}
                  {selectedAddress === addr.id && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{addr.address}</p>
                {addr.note && <p className="text-xs text-muted-foreground/80 mt-0.5">Catatan: {addr.note}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {showAddAddress ? (
        <div className="p-4 rounded-xl border border-border space-y-3 bg-muted/30">
          <p className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Alamat Baru
          </p>
          <div>
            <Label htmlFor="addrLabel">Nama Alamat</Label>
            <Input
              id="addrLabel"
              placeholder="cth: Rumah, Kantor"
              value={newAddress.label}
              onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="addrType">Tipe</Label>
            <div className="flex gap-2">
              {(["home", "office"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewAddress((p) => ({ ...p, type: t }))}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-sm",
                    newAddress.type === t ? "border-primary bg-green-50 text-primary" : "border-border text-muted-foreground"
                  )}
                >
                  {t === "home" ? "Rumah" : "Kantor"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="addrFull">Alamat Lengkap</Label>
            <Input
              id="addrFull"
              placeholder="Jl., No., Kelurahan, Kota"
              value={newAddress.address}
              onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="addrNote">Catatan (Opsional)</Label>
            <Input
              id="addrNote"
              placeholder="Pintu pagar, warna rumah, dll."
              value={newAddress.note}
              onChange={(e) => setNewAddress((p) => ({ ...p, note: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddAddress(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              disabled={!newAddress.label || !newAddress.address}
              onClick={() => {
                const id = `addr-${Date.now()}`;
                const newOne: SavedAddress = {
                  id,
                  label: newAddress.label,
                  type: newAddress.type,
                  address: newAddress.address,
                  note: newAddress.note || undefined,
                };
                setSavedAddresses((prev) => [...prev, newOne]);
                setSelectedAddress(id);
                setShowAddAddress(false);
                setNewAddress({ label: "", type: "home", address: "", note: "" });
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Simpan Alamat
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full" type="button" onClick={() => setShowAddAddress(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Alamat Baru
        </Button>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1 py-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Button onClick={() => setCurrentStep(5)} disabled={!selectedAddress} className="flex-1 py-6">
          Lanjut Konfirmasi
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep5Konfirmasi = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-600/10 px-4 py-1.5 text-sm font-semibold text-green-700">
          <PackageCheck className="h-4 w-4" />
          Konfirmasi Setoran
        </span>
        <h2 className="mt-3 text-xl font-semibold">Periksa & kirim setoranmu</h2>
        <p className="text-sm text-muted-foreground">Unggah bukti dan konfirmasi setoranmu</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Foto Bukti Sampah (maks. 5)</Label>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl border border-border overflow-hidden bg-muted">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Bukti ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Tambah Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>
          {photos.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <FileImage className="inline h-3 w-3 mr-1" />
              {photos.length} foto dipilih (akan dikompres otomatis)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Metode Pengambilan</Label>
          <div className="grid grid-cols-2 gap-3">
            {PICKUP_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setPickupMethod(method.id as "pickup" | "dropoff")}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  pickupMethod === method.id
                    ? "border-primary bg-green-50 shadow-md ring-2 ring-primary/20"
                    : "border-border hover:border-primary/60"
                )}
              >
                <div className={cn(
                  "mb-2 flex h-11 w-11 items-center justify-center rounded-xl",
                  pickupMethod === method.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {<method.icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />}
                </div>
                <p className="text-sm font-semibold">{method.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Catatan (Opsional)</Label>
          <textarea
            id="notes"
            placeholder="Deskripsi tambahan mengenai kondisi sampah..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <PackageCheck className="h-4 w-4 text-primary" />
            Ringkasan Setoran
          </p>
          <Badge variant="secondary">{items.length} item</Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Berat</span>
            <span className="font-semibold">{totals.totalWeightKg.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimasi Pendapatan</span>
            <span className="font-semibold text-green-600">{formatCurrency(totals.totalEarnings)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CO₂e yang Dihemat</span>
            <span className="font-semibold text-teal-600">{totals.totalCO2Saved.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Poin Reward</span>
            <span className="font-semibold text-amber-600">+{formatNumber(totals.totalPoints)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(4)} className="flex-1 py-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || items.length === 0 || !selectedAddress}
          className="flex-1 py-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <PackageCheck className="mr-2 h-4 w-4" />
              Submit Setoran
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      {renderStepIndicator()}
      <Card>
        <CardContent className="p-4 sm:p-6" key={currentStep}>
          <div className="animate-fade-up">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4Lokasi()}
            {currentStep === 5 && renderStep5Konfirmasi()}
          </div>
        </CardContent>
      </Card>

      {currentStep === 1 && items.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setCurrentStep(3)} className="py-6">
            Lihat Estimasi ({items.length} item)
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={submitSuccess !== null} onOpenChange={(open) => !open && setSubmitSuccess(null)}>
        <DialogContent className="text-center sm:max-w-sm">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg" aria-hidden="true">
            {["bg-green-500", "bg-amber-400", "bg-emerald-500", "bg-lime-400", "bg-teal-400", "bg-green-600", "bg-yellow-400", "bg-emerald-400"].map(
              (color, i) => (
                <span
                  key={i}
                  className={cn("animate-confetti-fall absolute top-2 block h-2.5 w-2.5 rounded-sm", color)}
                  style={{ left: `${8 + i * 12}%`, animationDelay: `${i * 0.08}s` }}
                />
              )
            )}
          </div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <PartyPopper className="h-7 w-7" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">Setoranmu berhasil dicatat!</DialogTitle>
            <DialogDescription className="text-center">
              Terima kasih sudah berkontribusi menjaga lingkungan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Berat</span>
              <span className="font-medium">{submitSuccess?.weight.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimasi Pendapatan</span>
              <span className="font-medium text-green-600">{formatCurrency(submitSuccess?.earnings ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Poin Didapat</span>
              <span className="font-medium text-amber-600">+{formatNumber(submitSuccess?.points ?? 0)} Poin</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => router.push("/riwayat")}>
              Lihat Riwayat
            </Button>
            <Button onClick={() => router.push("/dashboard")}>Kembali ke Dashboard</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
