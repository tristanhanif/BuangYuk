"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Mail, Lock, User, Phone, ArrowLeft, Truck, Warehouse, Store, Loader2 } from "lucide-react";

const ROLES = [
  { id: "customer", label: "Customer", desc: "Jual sampah & beli produk daur ulang", icon: User, color: "bg-green-100 text-green-600" },
  { id: "collector", label: "Collector", desc: "Ambil pickup sampah dari customer", icon: Truck, color: "bg-blue-100 text-blue-600" },
  { id: "bank_sampah", label: "Bank Sampah", desc: "Kelola supply & capacity sampah", icon: Warehouse, color: "bg-amber-100 text-amber-600" },
  { id: "umkm", label: "UMKM", desc: "Jual produk circular & recycled", icon: Store, color: "bg-purple-100 text-purple-600" },
] as const;

const baseSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phoneNumber: z.string().min(10, "Nomor HP minimal 10 digit").optional().or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof baseSchema>;

type RegisterFormData = z.infer<typeof baseSchema> & { selectedRole: string };

export default function RegisterRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(baseSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedRole) {
      setError("Pilih role terlebih dahulu");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.fullName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || null,
        role: selectedRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create role-specific profile
      switch (selectedRole) {
        case "collector":
          await setDoc(doc(db, "collectors", user.uid), {
            collectorId: user.uid,
            userId: user.uid,
            regionId: "bandung",
            availabilityStatus: "available",
            serviceRegions: ["bandung"],
            currentLocation: null,
            reliabilityScore: 50,
            reliabilityStatus: "normal",
            dailyCapacity: 50,
            currentLoad: 0,
            totalCompletedPickups: 0,
            totalCancelledPickups: 0,
            suspendedUntil: null,
            vehicleType: "motorcycle",
            maxCapacityKg: 50,
            currentLoadKg: 0,
            isActive: true,
            acceptanceRate: 1.0,
            totalPickups: 0,
            completedPickups: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          break;
        case "bank_sampah":
          await setDoc(doc(db, "waste_banks", user.uid), {
            userId: user.uid,
            name: data.fullName + " Bank Sampah",
            regionId: "bandung",
            address: "",
            lat: -6.9175,
            lng: 107.6191,
            dailyCapacityKg: 1000,
            currentLoadKg: 0,
            acceptedMaterials: ["kertas", "plastik", "logam", "kaca"],
            operatingHours: "08:00-17:00",
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          break;
        case "umkm":
          await setDoc(doc(db, "marketplace_sellers", user.uid), {
            userId: user.uid,
            businessName: data.fullName + " UMKM",
            regionId: "bandung",
            description: "",
            address: "",
            isActive: true,
            rating: 0,
            totalOrders: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          break;
      }

      // Create eco summary and wallet for all roles
      await setDoc(doc(db, "user_eco_summaries", user.uid), {
        userId: user.uid,
        totalCO2Saved: 0,
        totalEcoPoints: 0,
        totalTransactions: 0,
        wasteBreakdown: {},
        monthlyCO2Trend: [],
        lastUpdated: serverTimestamp(),
      });

      await setDoc(doc(db, "wallets", user.uid), {
        id: user.uid,
        userId: user.uid,
        balance: 0,
        ecoPoints: 0,
        currency: "IDR",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Set role cookie for middleware
      document.cookie = `buangyuk_role=${selectedRole}; path=/; max-age=86400`;

      // Redirect based on role
      switch (selectedRole) {
        case "admin":
          router.push("/admin");
          break;
        case "collector":
          router.push("/collector");
          break;
        case "bank_sampah":
          router.push("/bank-sampah");
          break;
        case "umkm":
          router.push("/umkm");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mendaftar";
      if (message.includes("email-already-in-use")) {
        setError("Email sudah terdaftar");
      } else {
        setError("Gagal mendaftar. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
              <Leaf className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Daftar BuangYuk</CardTitle>
            <CardDescription>Pilih peran Anda di ekosistem BuangYuk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-left hover:shadow-md"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${role.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{role.label}</p>
                    <p className="text-sm text-muted-foreground">{role.desc}</p>
                  </div>
                </button>
              );
            })}
            <p className="text-center text-sm text-muted-foreground pt-4">
              Sudah punya akun? <Link href="/login" className="text-primary hover:underline">Masuk</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedRoleData = ROLES.find((r) => r.id === selectedRole);
  const RoleIcon = selectedRoleData?.icon || User;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={() => setSelectedRole(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${selectedRoleData?.color} mx-auto mb-4`}>
            <RoleIcon className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Daftar sebagai {selectedRoleData?.label}</CardTitle>
          <Badge variant="outline">{selectedRoleData?.desc}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <            Label htmlFor="fullName">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" placeholder="Masukkan nama" className="pl-10" {...register("fullName")} />
              </div>
              {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="email@contoh.com" className="pl-10" {...register("email")} />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Nomor HP (Opsional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phoneNumber" type="tel" placeholder="08xxxxxxxxxx" className="pl-10" {...register("phoneNumber")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Minimal 6 karakter" className="pl-10" {...register("password")} />
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Ulangi password" className="pl-10" {...register("confirmPassword")} />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : "Daftar"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun? <Link href="/login" className="text-primary hover:underline">Masuk</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
