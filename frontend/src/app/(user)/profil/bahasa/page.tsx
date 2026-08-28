"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Check, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const LANGUAGES = [
  { id: "id", label: "Bahasa Indonesia", flag: "ID", isDefault: true },
  { id: "en", label: "English", flag: "EN", isDefault: false },
];

export default function BahasaPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("id");

  const handleSave = () => {
    toast({ title: "Preferensi bahasa disimpan", description: "Bahasa antarmuka disimpan.", variant: "success" });
    router.push("/profil");
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
        <Languages className="h-6 w-6 text-primary" />
        Bahasa
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pilih Bahasa Antarmuka</CardTitle>
          <CardDescription>Bahasa pengaturan aplikasi BuangYuk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelected(lang.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                selected === lang.id ? "border-primary bg-green-50" : "border-border hover:border-primary/50"
              )}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-primary shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{lang.label}</p>
                <p className="text-xs text-muted-foreground">{lang.flag}</p>
              </div>
              {selected === lang.id && <Check className="h-5 w-5 text-primary" />}
            </button>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave}>
        Simpan Preferensi
      </Button>
    </div>
  );
}
