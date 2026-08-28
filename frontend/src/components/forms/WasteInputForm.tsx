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
import { formatCurrency, formatNumber, compressImage, cn } from "@/lib/utils";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Camera,
  Trash2,
  Plus,
  FileImage,
  X,
  Truck,
  Store,
  Loader2,
} from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const STEPS = ["Pilih Material", "Input Kuantitas", "Estimasi", "Unggah & Kirim"];

export function WasteInputForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, addItem, updateItem, removeItem, clearItems, totals } = useWasteCalculator();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<"kg" | "pcs">("kg");
  const [pickupMethod, setPickupMethod] = useState<"pickup" | "dropoff">("dropoff");
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCat = WASTE_CATEGORIES.find((c) => c.id === selectedCategory);
  const currentUnit = selectedCat?.unit || "kg";

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    const cat = WASTE_CATEGORIES.find((c) => c.id === categoryId);
    if (cat) setUnit(cat.unit === "pcs" ? "pcs" : "kg");
    setCurrentStep(2); // Auto-advance to Input Kuantitas
  }, []);

  const handleAddItem = useCallback(() => {
    if (!selectedCategory || !quantity) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    addItem({
      categoryId: selectedCategory,
      quantity: qty,
      unit: currentUnit === "pcs" ? "pcs" : unit,
    });

    setSelectedCategory(null);
    setQuantity("");
    setCurrentStep(1);
  }, [selectedCategory, quantity, currentUnit, unit, addItem]);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const compressed = await Promise.all(files.map((f) => compressImage(f)));
    setPhotos((prev) => [...prev, ...compressed].slice(0, 5));
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!user || items.length === 0) return;
    setIsSubmitting(true);
    setUploadProgress({ current: 0, total: photos.length });

    try {
      console.log("Starting submission...", { itemsCount: items.length, photosCount: photos.length });

      const photoUrls = photos.length > 0
        ? await uploadMultipleToCloudinary(photos, `waste-submissions/${user.uid}`, (current, total) => {
            setUploadProgress({ current, total });
            console.log(`Upload progress: ${current}/${total}`);
          })
        : [];

      console.log("Photos uploaded:", photoUrls);
      console.log("Writing to Firestore...");

      const docRef = await addDoc(collection(db, "transactions"), {
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

      console.log("Transaction saved to Firestore, doc ID:", docRef.id);

      clearItems();
      setPhotos([]);
      setNotes("");
      setUploadProgress(null);
      console.log("Redirecting to /riwayat...");
      router.push("/riwayat");
      // Fallback jika router.push tidak jalan
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.href = "/riwayat";
      }, 1000);
    } catch (err) {
      console.error("Submission error:", err);
      const message = err instanceof Error ? err.message : "Gagal mengirim transaksi. Silakan coba lagi.";
      alert(message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }, [user, items, photos, pickupMethod, notes, totals, clearItems, router]);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              currentStep > index + 1
                ? "bg-primary text-primary-foreground"
                : currentStep === index + 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {currentStep > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
          </div>
          <span
            className={cn(
              "text-sm hidden sm:block",
              currentStep === index + 1 ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {step}
          </span>
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                "w-8 h-0.5",
                currentStep > index + 1 ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Pilih Jenis Sampah</h2>
        <p className="text-sm text-muted-foreground">Pilih kategori sampah yang ingin disetor</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {WASTE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
              selectedCategory === cat.id
                ? "border-primary bg-green-50"
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="text-2xl block mb-2">{cat.icon}</span>
            <p className="text-sm font-medium text-foreground">{cat.label}</p>
            <p className="text-xs text-muted-foreground mt-1">Satuan: {cat.unit}</p>
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm font-medium mb-2">Item ditambahkan: {items.length}</p>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>
                  {WASTE_CATEGORIES.find((c) => c.id === item.categoryId)?.icon}{" "}
                  {WASTE_CATEGORIES.find((c) => c.id === item.categoryId)?.label}
                </span>
                <div className="flex items-center gap-2">
                  <span>{item.quantity} {item.unit}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500"
                    onClick={() => removeItem(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
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

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">Input Kuantitas</h2>
          <p className="text-sm text-muted-foreground">
            {selectedCat.icon} {selectedCat.label}
          </p>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Kuantitas</Label>
                <div className="flex gap-3">
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 text-lg"
                  />
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setUnit("kg")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
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
                        "px-4 py-2 text-sm font-medium transition-colors",
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

              {qty > 0 && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                  <strong>Bobot Ternormalisasi:</strong> {stdWeight.toFixed(2)} kg
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button
            onClick={handleAddItem}
            disabled={!quantity || parseFloat(quantity) <= 0}
            className="flex-1"
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
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Estimasi Setoran</h2>
        <p className="text-sm text-muted-foreground">Preview estimasi pendapatan & dampak karbon</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Belum ada item yang ditambahkan.</p>
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="mt-4">
            Kembali ke Pilih Material
          </Button>
        </div>
      ) : (
        <>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <Badge variant="warning" className="mb-3">Estimasi Sementara (Draft)</Badge>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(totals.totalEarnings)}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimasi Pendapatan</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {totals.totalCO2Saved.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">kg CO₂e Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatNumber(totals.totalPoints)}
                  </p>
                  <p className="text-xs text-muted-foreground">Poin Reward</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="font-medium text-sm">Rincian Item:</p>
            {items.map((item, idx) => {
              const cat = WASTE_CATEGORIES.find((c) => c.id === item.categoryId);
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{cat?.icon}</span>
                    <span>{cat?.label}</span>
                    <span className="text-muted-foreground">
                      {item.quantity} {item.unit} → {item.standardizedWeightKg.toFixed(2)} kg
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.estimatedEarnings)}</p>
                    <p className="text-xs text-green-600">{item.estimatedCO2Saved.toFixed(1)} kg CO₂e</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
            <Button onClick={() => setCurrentStep(4)} className="flex-1">
              Lanjut
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Unggah Bukti & Pilih Metode</h2>
        <p className="text-sm text-muted-foreground">Lampirkan foto dan pilih cara pengambilan</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Foto Bukti Sampah (maks. 5)</Label>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted">
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
              <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
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
                  "p-4 rounded-xl border-2 text-left transition-all",
                  pickupMethod === method.id
                    ? "border-primary bg-green-50"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-2xl block mb-2">{method.icon}</span>
                <p className="text-sm font-medium">{method.label}</p>
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

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1" disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || items.length === 0}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress ? (
                `Mengunggah ${uploadProgress.current}/${uploadProgress.total}...`
              ) : (
                "Menyimpan..."
              )}
            </>
          ) : (
            <>
              {pickupMethod === "pickup" ? <Truck className="mr-2 h-4 w-4" /> : <Store className="mr-2 h-4 w-4" />}
              Kirim Setoran
            </>
          )}
        </Button>
      </div>
      {uploadProgress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Mengunggah foto...</span>
            <span>{uploadProgress.current}/{uploadProgress.total}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {renderStepIndicator()}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </CardContent>
      </Card>

      {currentStep === 1 && items.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setCurrentStep(3)}>
            Lihat Estimasi ({items.length} item)
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
