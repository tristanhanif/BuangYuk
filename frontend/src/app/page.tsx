"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link"; // <-- Tambahkan ini
import { Leaf, ArrowRight } from "lucide-react"; // <-- Tambahkan ini
import { Button } from "@/components/ui/button"; // <-- Tambahkan ini
import { useAuth } from "@/hooks/useAuth";

export default function SplashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
    }, 1700);

    const redirect = setTimeout(() => {
      router.replace(user ? "/dashboard" : "/login");
    }, 2300);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirect);
    };
  }, [router, user]);

  return (
    <div className="min-h-screen bg-background" style={{ opacity, transition: "opacity 0.6s ease" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
              <Leaf className="h-4 w-4" />
              <span>Platform Daur Ulang Terintegrasi</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
              Ubah Sampah Jadi <span className="text-primary">Nilai & Dampak Nyata</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Platform pertama yang menggabungkan penimbangan real-time, tracking karbon transparan,
              dan gamifikasi ekologi. Setor sampah, dapatkan uang & poin, lihat dampak karbonmu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Mulai Sekarang <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
            <div className="mx-6 mt-3 rounded-full bg-black/35 blur-md"
              style={{ height: 10, boxShadow: "0 0 22px 12px rgba(0,0,0,0.35)" }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center mt-9">
          <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
            Buang<b className="font-semibold text-emerald-600">Yuk</b>
          </h1>
          <p className="mt-3 animate-fade-up text-sm font-light tracking-wide text-muted-foreground" style={{ animationDelay: "0.15s" }}>
            Setor sampah, panen manfaat
          </p>

          <div className="mt-12 flex animate-fade-up flex-col items-center" style={{ animationDelay: "0.3s" }}>
            <div className="h-px w-36 overflow-hidden rounded-full bg-primary/20">
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-primary" />
            </div>
            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
              Menyiapkan
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}