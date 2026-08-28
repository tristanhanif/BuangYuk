"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Leaf, Info, BookOpen, FileText, ShieldQuestion, Mail, ChevronRight } from "lucide-react";

const INFO_LINKS = [
  { icon: <BookOpen className="h-5 w-5" />, label: "Tentang BuangYuk", desc: "Misi & visi platform" },
  { icon: <FileText className="h-5 w-5" />, label: "Syarat & Ketentuan", desc: "Ketentuan penggunaan layanan" },
  { icon: <ShieldQuestion className="h-5 w-5" />, label: "Kebijakan Privasi", desc: "Cara kami mengelola data kamu" },
  { icon: <Mail className="h-5 w-5" />, label: "Hubungi Kami", desc: "support@buangyuk.id" },
];

export default function InformasiPage() {
  const router = useRouter();

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
        <Info className="h-6 w-6 text-primary" />
        Informasi
      </h1>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col items-center py-8 border-b border-border">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <Leaf className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-bold">BuangYuk</h2>
            <p className="text-sm text-muted-foreground">v1.0.0</p>
            <p className="text-center text-sm text-muted-foreground px-6 mt-2 max-w-sm">
              Platform pengolahan & daur ulang sampah terintegrasi dengan tracking karbon real-time dan
              gamifikasi ekologi.
            </p>
          </div>
          <div className="divide-y divide-border">
            {INFO_LINKS.map((link) => (
              <a
                key={link.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-primary shrink-0">
                    {link.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <p className="text-center text-xs text-muted-foreground pb-8">
        © 2026 BuangYuk. Hak Cipta Dilindungi.
      </p>
    </div>
  );
}
