"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

interface Address {
  id: string;
  label: string;
  type: "home" | "office";
  address: string;
  note?: string;
}

const INITIAL: Address[] = [
  { id: "addr-1", label: "Rumah", type: "home", address: "Jl. Lingkungan No. 1, Jakarta Timur" },
  { id: "addr-2", label: "Kantor", type: "office", address: "Jl. Sudirman Kav. 52-53, Jakarta Selatan" },
];

export default function LokasiPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(INITIAL);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: "", type: "home" as "home" | "office", address: "", note: "" });

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Alamat dihapus", variant: "success" });
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
        <MapPin className="h-6 w-6 text-primary" />
        Lokasi Tersimpan
      </h1>

      <Card>
        <CardContent className="p-4 space-y-3">
          {addresses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada alamat tersimpan.</p>
          )}
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start gap-3 p-3 rounded-xl border border-border">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-primary shrink-0">
                {addr.type === "home" ? <Home className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{addr.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{addr.address}</p>
                {addr.note && <p className="text-xs text-muted-foreground/80">Catatan: {addr.note}</p>}
              </div>
              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeAddress(addr.id)} aria-label={`Hapus ${addr.label}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {showAdd ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Alamat Baru</p>
            <div>
              <Label htmlFor="label">Nama Alamat</Label>
              <Input id="label" placeholder="cth: Rumah" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="type">Tipe</Label>
              <div className="flex gap-2">
                {(["home", "office"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, type: t }))}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-sm",
                      form.type === t ? "border-primary bg-green-50 text-primary" : "border-border text-muted-foreground"
                    )}
                  >
                    {t === "home" ? "Rumah" : "Kantor"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="full">Alamat Lengkap</Label>
              <Input id="full" placeholder="Jl., No., Kelurahan, Kota" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button
                className="flex-1"
                disabled={!form.label || !form.address}
                onClick={() => {
                  setAddresses((prev) => [...prev, { id: `addr-${Date.now()}`, ...form, note: form.note || undefined }]);
                  setShowAdd(false);
                  setForm({ label: "", type: "home", address: "", note: "" });
                  toast({ title: "Alamat ditambahkan", variant: "success" });
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Alamat Baru
        </Button>
      )}
    </div>
  );
}
