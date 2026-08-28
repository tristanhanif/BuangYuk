"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, KeyRound, Smartphone, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function KeamananPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChangePassword = async () => {
    setIsLoading(true);
    try {
      if (!auth.currentUser) throw new Error("no-user");
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword("");
      toast({ title: "Kata sandi berhasil diubah", variant: "success" });
    } catch {
      toast({ title: "Gagal mengubah kata sandi. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/profil")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Profil
      </button>

      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        Keamanan & Privasi
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Ubah Kata Sandi
          </CardTitle>
          <CardDescription>Gunakan minimal 6 karakter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Kata Sandi Baru</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi baru"
                className="pl-10 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={isLoading || newPassword.length < 6}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Ubah Kata Sandi
          </Button>
          <p className="text-xs text-muted-foreground">
            Untuk mengubah kata sandi, konfirmasi ulang dengan masuk kembali tidak diperlukan jika sesi aktif.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Verifikasi Dua Langkah (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Aktifkan 2FA</p>
              <p className="text-xs text-muted-foreground">
                Tambahkan lapisan keamanan ekstra pada akun kamu (demo)
              </p>
            </div>
            <button
              role="switch"
              aria-checked={twoFactor}
              aria-label="Verifikasi Dua Langkah"
              onClick={() => {
                setTwoFactor((v) => !v);
                toast({ title: twoFactor ? "2FA dinonaktifkan" : "2FA diaktifkan", variant: "success" });
              }}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                twoFactor ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  twoFactor ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <p className="text-center text-xs text-muted-foreground pb-8">
        Data kamu aman bersama BuangYuk. Lihat{" "}
        <a href="/profil/informasi" className="text-primary hover:underline">Kebijakan Privasi</a>
      </p>
    </div>
  );
}
