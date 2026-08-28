"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { articlesMock } from "@/mocks/articlesMock";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  Leaf,
  Recycle,
  Droplet,
  ArrowRight,
  Search,
} from "lucide-react";

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
    icon: Leaf,
    title: "Jadwal Setor Rutin",
    desc: "Tetapkan hari tetap untuk setor sampah, misal setiap Sabtu pagi.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default function EdukasiPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articlesMock.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
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
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/edukasi/${article.id}`} className="block">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted mb-4">
                        <img
                          src={article.imageUrl}
                          alt={article.altText}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(article.date)}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                      <Button variant="ghost" size="sm" className="text-primary mt-2 px-0">
                        Baca
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${tip.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Estimasi dampak karbon dihitung menggunakan pendekatan dari EPA Waste Reduction Model (WARM),
            dibulatkan untuk kebutuhan simulasi aplikasi — bukan angka sertifikasi karbon resmi.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

