"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export interface ProductCardProps {
  imageUrl: string;
  name: string;
  priceRp: number;
  pricePoints: number;
  sellerName: string;
  stock: number;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({
  imageUrl,
  name,
  priceRp,
  pricePoints,
  sellerName,
  stock,
  onClick,
  className,
}: ProductCardProps) {
  const outOfStock = stock <= 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <Badge variant="destructive" className="text-sm">Stok Habis</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-1 font-medium text-foreground" title={name}>{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sellerName}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">{formatCurrency(priceRp)}</span>
          <span className="text-xs font-semibold text-amber-600">
            {pricePoints.toLocaleString("id-ID")} Poin
          </span>
        </div>
      </div>
    </button>
  );
}
