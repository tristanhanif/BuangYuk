"use client";

import { useParams, useRouter } from "next/navigation";
import { articlesMock } from "@/mocks/articlesMock";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const article = articlesMock.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="py-12">
        <EmptyState
          illustration="empty-missions"
          title="Artikel tidak ditemukan"
          description="Artikel yang kamu cari tidak tersedia."
          actionLabel="Kembali ke Edukasi"
          onAction={() => router.push("/edukasi")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.push("/edukasi")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Edukasi
      </button>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="relative aspect-video w-full bg-muted">
          <img src={article.imageUrl} alt={article.altText} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">{article.category}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(article.date)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">{article.title}</h1>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            {article.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => router.push("/edukasi")}>
        Baca Artikel Lainnya
      </Button>
    </div>
  );
}
