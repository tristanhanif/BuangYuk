"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, ShieldCheck, Palette, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

const TOGGLES: { id: string; label: string; desc: string; icon: React.ReactNode; defaultValue: boolean }[] = [
  { id: "notif-transaksi", label: "Notifikasi Transaksi", desc: "Pemberitahuan status setoran & pembayaran", icon: <Bell className="h-5 w-5" />, defaultValue: true },
  { id: "notif-poin", label: "Info Poin & Reward", desc: "Update poin, tukar poin, dan penawaran khusus", icon: <ShieldCheck className="h-5 w-5" />, defaultValue: true },
  { id: "notif-produk", label: "Kampanye & Edukasi", desc: "Artikel, tips, dan kegiatan komunitas", icon: <HelpCircle className="h-5 w-5" />, defaultValue: false },
];

export default function PengaturanPage() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.id, t.defaultValue]))
  );

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
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

      <h1 className="text-2xl font-bold text-foreground">Pengaturan Akun</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifikasi</CardTitle>
          <CardDescription>Kelola notifikasi yang kamu terima</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {TOGGLES.map((t, i) => (
            <div key={t.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-primary shrink-0">
                    {t.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={toggles[t.id]}
                  aria-label={t.label}
                  onClick={() => setToggles((p) => ({ ...p, [t.id]: !p[t.id] }))}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    toggles[t.id] ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      toggles[t.id] ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferensi Tampilan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium flex-1">Mode Gelap</span>
            <button
              role="switch"
              aria-checked={false}
              aria-label="Mode Gelap"
              className="relative h-6 w-11 rounded-full bg-muted"
            >
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow translate-x-0.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Keluar dari Akun
      </Button>

      <Button className="w-full" onClick={() => toast({ title: "Pengaturan disimpan", variant: "success" })}>
        Simpan Pengaturan
      </Button>
    </div>
  );
}
