"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Phone, Loader2, Upload } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { toast } from "@/components/ui/toast";

export default function EditProfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold mb-2">Silakan login terlebih dahulu</h1>
        <Button variant="outline" onClick={() => router.push("/login")}>Login</Button>
      </div>
    );
  }

  const userInitials =
    user.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(user, { displayName: displayName || user.displayName });
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName || user.displayName,
        phoneNumber: phoneNumber || null,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Profil berhasil diperbarui", variant: "success" });
      router.push("/profil");
    } catch {
      toast({ title: "Gagal memperbarui profil. Coba lagi.", variant: "destructive" });
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

      <h1 className="text-2xl font-bold text-foreground">Edit Profil</h1>

      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.photoURL || undefined} alt={displayName || "User"} />
            <AvatarFallback className="text-2xl font-bold bg-green-100 text-green-700">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Ganti Foto Profil
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Diri</CardTitle>
          <CardDescription>Perbarui informasi akun kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="displayName" className="pl-10" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" value={user.email || ""} disabled />
            </div>
            <p className="text-xs text-muted-foreground">Email tidak dapat diubah di sini.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Nomor HP</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="phoneNumber" type="tel" className="pl-10" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/profil")}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={isLoading || !displayName.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
