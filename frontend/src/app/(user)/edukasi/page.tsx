"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { articlesMock } from "@/mocks/articlesMock";
import { formatDate, cn } from "@/lib/utils";
import {
  BookOpen,
  Leaf,
  Recycle,
  Droplet,
  ArrowRight,
  Search,
  Sparkles,
  Lightbulb,
  Newspaper,
  FlaskConical,
  Clock,
} from "lucide-react";

const tips = [
  {
    icon: Droplet,
    title: "Cuci Kemasan Sebelum Dibuang",
    desc: "Botol dan kaleng yang bersih memiliki nilai jual 30% lebih tinggi.",
    color: "from-blue-500/15 to-blue-600/5 text-blue-600",
  },
  {
    icon: Recycle,
    title: "Pisahkan dari Sumber",
    desc: "Pisahkan sampah organik dan anorganik sejak di rumah.",
    color: "from-green-500/15 to-green-600/5 text-green-600",
  },
  {
    icon: Leaf,
    title: "Jadwal Setor Rutin",
    desc: "Tetapkan hari tetap untuk setor sampah, misal setiap Sabtu pagi.",
    color: "from-emerald-500/15 to-emerald-600/5 text-emerald-600",
  },
  {
    icon: Lightbulb,
    title: "Kurangi Penggunaan Plastik",
    desc: "Bawa tas belanja sendiri dan tolak sedotan plastik sekali pakai.",
    color: "from-amber-500/15 to-amber-600/5 text-amber-600",
  },
  {
    icon: Recycle,
    title: "Perbaiki, Jangan Buang",
    desc: "Rusak sedikit? Perbaiki dulu sebelum memutuskan membuang barang.",
    color: "from-sky-500/15 to-sky-600/5 text-sky-600",
  },
  {
    icon: Leaf,
    title: "Kompos Sisa Makanan",
    desc: "Olah sisa dapur menjadi kompos untuk menyuburkan tanamanmu.",
    color: "from-teal-500/15 to-teal-600/5 text-teal-600",
  },
];

const CATEGORY_STYLES: Record<string, { label: string; badge: "success" | "info" | "warning" }> = {
  "Tips Pemilahan": { label: "Tips Pemilahan", badge: "success" },
  "Fakta Daur Ulang": { label: "Fakta Daur Ulang", badge: "info" },
  "Dampak Lingkungan": { label: "Dampak Lingkungan", badge: "warning" },
};

const categoryFilters: Array<{ label: string; value: string }> = [
  { label: "Semua", value: "all" },
  { label: "Tips Pemilahan", value: "Tips Pemilahan" },
  { label: "Fakta Daur Ulang", value: "Fakta Daur Ulang" },
  { label: "Dampak Lingkungan", value: "Dampak Lingkungan" },
];

export default function EdukasiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredArticles = articlesMock.filter((article) => {
    const matchSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === "all" || article.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="relative">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Pusat Edukasi
          </span>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">Edukasi & Tips</h1>
          <p className="mt-2 max-w-lg text-sm text-white/85">
            Artikel dan tips untuk mengelola sampah dengan lebih baik — mulai dari
            memilah, mendaur ulang, hingga memahami dampaknya terhadap lingkungan.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-white/70" />
              <span>{articlesMock.length} Artikel Edukasi</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-white/70" />
              <span>{tips.length} Tips Praktis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari artikel atau topik..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="mb-4 grid w-full max-w-md grid-cols-2 rounded-xl p-1">
          <TabsTrigger value="articles" className="flex items-center gap-2 rounded-lg">
            <BookOpen className="h-4 w-4" />
            Artikel
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2 rounded-lg">
            <Leaf className="h-4 w-4" />
            Tips Cepat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-4 space-y-5">
          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => {
              const isActive = activeCategory === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveCategory(filter.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium text-foreground">
                  Tidak ditemukan artikel untuk &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coba kata kunci lain atau pilih kategori yang berbeda.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                >
                  Reset Filter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => {
                const catStyle = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES["Tips Pemilahan"];
                return (
                  <Link
                    key={article.id}
                    href={`/edukasi/${article.id}`}
                    className="group flex flex-col"
                  >
                    <Card className="flex h-full flex-col overflow-hidden border-border transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={article.imageUrl}
                          alt={article.altText}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <Badge
                          variant={catStyle.badge}
                          className="absolute left-3 top-3 border-0 shadow-sm"
                        >
                          {article.category}
                        </Badge>
                      </div>
                      <CardContent className="flex flex-1 flex-col p-5">
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(article.date)}
                        </div>
                        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
                          {article.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {article.summary}
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 pt-1 text-sm font-medium text-primary">
                          Baca Selengkapnya
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tips" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card
                  key={index}
                  className="relative overflow-hidden border-border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", tip.color)} />
                  <CardContent className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-border">
                        <Icon className="h-6 w-6 text-foreground/80" />
                      </div>
                      <span className="text-3xl font-bold text-foreground/10">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{tip.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{tip.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
              <FlaskConical className="h-5 w-5" />
            </div>
            <p className="text-xs text-emerald-800">
              Estimasi dampak karbon dihitung menggunakan pendekatan dari EPA Waste Reduction Model
              (WARM), dibulatkan untuk kebutuhan simulasi aplikasi — bukan angka sertifikasi karbon resmi.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
