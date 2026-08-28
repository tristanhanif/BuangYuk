"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/feature/ProductCard";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useMockFetch } from "@/hooks/useMockFetch";
import { productsMock, productCategories } from "@/mocks/productsMock";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { formatNumber } from "@/lib/utils";
import { Search, ShoppingBag, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TukarPoinPage() {
  const { data, isLoading, error, refetch } = useMockFetch(productsMock, { delayMs: 500 });
  const { ecoSummary } = useEcoTracker();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("semua");

  const pointsBalance = ecoSummary?.totalEcoPoints ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <LoadingSkeleton variant="card" count={6} className="h-56" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          illustration="empty-history"
          title="Gagal memuat data"
          description={error}
          actionLabel="Coba Lagi"
          onAction={refetch}
        />
      </div>
    );
  }

  const filteredProducts = (data ?? []).filter((product) => {
    const matchCategory = category === "semua" || product.category === category;
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Tukar Poin
          </h1>
          <p className="text-muted-foreground mt-1">
            Tukarkan poinmu menjadi produk daur ulang dari UMKM binaan
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
          <Coins className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-xs text-muted-foreground leading-none">Saldo Poin</p>
            <p className="font-bold text-amber-600 leading-tight">{formatNumber(pointsBalance)} Poin</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk daur ulang..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {productCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
              category === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          illustration="empty-missions"
          title="Produk tidak ditemukan"
          description="Produk tidak ditemukan. Coba kata kunci lain."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/tukar-poin/${product.id}`} className="block">
              <ProductCard
                imageUrl={product.imageUrl}
                name={product.name}
                priceRp={product.priceRp}
                pricePoints={product.pricePoints}
                sellerName={product.sellerName}
                stock={product.stock}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
