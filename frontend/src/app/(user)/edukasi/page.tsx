"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Leaf,
  Recycle,
  Zap,
  Droplet,
  Sun,
  TreePine,
  Factory,
  ArrowRight,
  Search,
} from "lucide-react";

const articles = [
  {
    id: 1,
    title: "Mengapa Daur Ulang Plastik Penting untuk Bumi?",
    category: "Daur Ulang",
    icon: Recycle,
    color: "bg-green-50 text-green-600",
    readTime: "5 menit",
    summary:
      "Plastik membutuhkan 500-1000 tahun untuk terurai. Daur ulang 1 kg plastik PET dapat mengurangi 2.5 kg emisi CO₂. Pelajari bagaimana proses daur ulang bekerja dan dampak nyatanya.",
    tags: ["Plastik", "CO₂", "Lingkungan"],
  },
  {
    id: 2,
    title: "E-Waste: Bahaya Tersembunyi di Gadget Rusak",
    category: "E-Waste",
    icon: Zap,
    color: "bg-purple-50 text-purple-600",
    readTime: "7 menit",
    summary:
      "Satu ponsel mengandung emas, perak, dan tembaga yang bisa didaur ulang. Namun juga mengandung merkuri dan timbal yang berbahaya jika dibuang sembarangan.",
    tags: ["Elektronik", "Bahaya", "Daur Ulang"],
  },
  {
    id: 3,
    title: "Membuat Kompos dari Sampah Organik Rumah Tangga",
    category: "Tips",
    icon: Leaf,
    color: "bg-emerald-50 text-emerald-600",
    readTime: "4 menit",
    summary:
      "Sampah organik mencakup 60% volume sampah rumah tangga. Komposting dapat mengurangi emisi metana dari TPA hingga 50%.",
    tags: ["Organik", "Kompos", "Rumah Tangga"],
  },
  {
    id: 4,
    title: "Menghitung Jejak Karbon Pribadi Anda",
    category: "Edukasi",
    icon: Factory,
    color: "bg-blue-50 text-blue-600",
    readTime: "6 menit",
    summary:
      "Rata-rata orang Indonesia menghasilkan 2.4 ton CO₂ per tahun. Pelajari cara menghitung dan mengurangi jejak karbonmu melalui pengelolaan sampah.",
    tags: ["Karbon", "Kalkulasi", "Pribadi"],
  },
  {
    id: 5,
    title: "10 Kebiasaan Zero Waste untuk Pemula",
    category: "Gaya Hidup",
    icon: Sun,
    color: "bg-amber-50 text-amber-600",
    readTime: "3 menit",
    summary:
      "Mulai dari membawa tas belanja sendiri, menghindari kemasan sekali pakai, hingga memilih produk refill. Langkah kecil yang berdampak besar.",
    tags: ["Zero Waste", "Kebiasaan", "Pemula"],
  },
  {
    id: 6,
    title: "Manfaat Ekonomi Daur Ulang bagi Komunitas",
    category: "Ekonomi",
    icon: TreePine,
    color: "bg-teal-50 text-teal-600",
    readTime: "5 menit",
    summary:
      "Bank sampah dapat menciptakan lapangan kerja dan menghasilkan Rp 1.5-15.000 per kg sampah terkumpul. Daur ulang bukan hanya soal lingkungan, tapi juga ekonomi.",
    tags: ["Ekonomi", "Komunitas", "Bank Sampah"],
  },
];

const tips = [
  {
    icon: Droplet,
    title: "Cuci Kemasan Sebelum Dibuang",
    desc: "Botol dan kaleng yang bersih memiliki nilai jual 30% lebih tinggi.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Recycle,
    title: "Pisahkan dari Sumber",
    desc: "Pisahkan sampah organik dan anorganik sejak di rumah.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Zap,
    title: "Kumpulkan E-Waste Terpisah",
    desc: "HP, kabel, baterai, dan charger harus dikumpulkan di kotak khusus.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Sun,
    title: "Lipat Karton dengan Rapi",
    desc: "Memplatkan karton menghemat volume transportasi hingga 80%.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Leaf,
    title: "Jadwal Setor Rutin",
    desc: "Tetapkan hari tetap untuk setor sampah, misal setiap Sabtu pagi.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: TreePine,
    title: "Pilih Kemasan Daur Ulang",
    desc: "Belilah produk dengan label rPET atau recycled material.",
    color: "bg-teal-50 text-teal-600",
  },
];

export default function EdukasiPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edukasi & Tips</h1>
        <p className="text-muted-foreground">
          Artikel dan tips untuk mengelola sampah dengan lebih baik
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari artikel atau topik..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Artikel
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Tips Cepat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4 mt-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Tidak ditemukan artikel untuk &ldquo;{searchQuery}&rdquo;
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => {
                const Icon = article.icon;
                return (
                  <Card
                    key={article.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div
                          className={`inline-flex items-center justify-center w-12 h-12 rounded-lg shrink-0 ${article.color}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.readTime}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {article.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary">
                              Baca
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tips" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${tip.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
