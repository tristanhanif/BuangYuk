"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Leaf, Sparkles, Recycle, Zap, Droplet, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const tips = [
  {
    id: 1,
    title: "Pisahkan Sampah dari Sumber",
    desc: "Memisahkan sampah organik & anorganik di rumah mempermudah proses daur ulang dan meningkatkan nilai jual sampah Anda hingga 30%.",
    icon: Recycle,
    color: "bg-green-50 text-green-600",
    category: "Dasar",
  },
  {
    id: 2,
    title: "Bersihkan Kemasan Sebelum Disetor",
    desc: "Mencuci botol plastik & kaleng dari sisa makanan/minuman mencegah kontaminasi, sehingga harga per kg naik dan proses daur ulang lebih efisien.",
    icon: Droplet,
    color: "bg-blue-50 text-blue-600",
    category: "Tips",
  },
  {
    id: 3,
    title: "Kumpulkan E-Waste Terpisah",
    desc: "HP rusak, kabel, baterai, dan aksesoris elektronik memiliki nilai tinggi & berbahaya jika dibuang sembarangan. Kumpulkan di kotak terpisah.",
    icon: Zap,
    color: "bg-purple-50 text-purple-600",
    category: "E-Waste",
  },
  {
    id: 4,
    title: "Lipat Karton & Kertas Rapi",
    desc: "Memplatkan kotak karton menghemat volume transportasi hingga 80%, mengurangi emisi carbon footprint pengangkutan sampah.",
    icon: Leaf,
    color: "bg-emerald-50 text-emerald-600",
    category: "Kertas",
  },
  {
    id: 5,
    title: "Jadwal Setor Rutin Mingguan",
    desc: "Menetapkan hari tetap untuk mengantar/setor sampah membangun kebiasaan berkelanjutan dan memaksimalkan poin reward bulanan.",
    icon: Sparkles,
    color: "bg-amber-50 text-amber-600",
    category: "Kebiasaan",
  },
  {
    id: 6,
    title: "Pilih Produk Kemasan Daur Ulang",
    desc: "Membeli produk dengan kemasan rPET (recycled PET) atau kemasan ulang mendorong ekonomi sirkular dan menurunkan permintaan plastik baru.",
    icon: Sun,
    color: "bg-orange-50 text-orange-600",
    category: "Konsumen",
  },
];

export function EcoTipsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 1;
  const maxIndex = tips.length - itemsPerView;

  const next = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  const prev = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Rekomendasi Eco-Tips
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prev} aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={next} aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {tips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div key={tip.id} className="w-full flex-shrink-0 px-2">
                  <div className="h-full p-4 rounded-xl border border-border bg-white">
                    <div className="flex items-start gap-3">
                      <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-lg shrink-0", tip.color)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {tip.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-1 mt-4">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to tip ${index + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}