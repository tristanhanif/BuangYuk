"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  ShoppingBag,
  Recycle,
  Star,
  Leaf,
} from "lucide-react";

const FALLBACK_PRODUCTS = [
  { id: "1", name: "Tas Daur Ulang PET", sellerName: "EcoCraft Bandung", price: 45000, rating: 4.8, totalSold: 128, materialsUsed: ["Plastik PET"], isRecycled: true, imageUrl: "", category: "Tas" },
  { id: "2", name: "Dompet Recycled Denim", sellerName: "GreenThread", price: 75000, rating: 4.9, totalSold: 89, materialsUsed: ["Denim", "Plastik"], isRecycled: true, imageUrl: "", category: "Aksesoris" },
  { id: "3", name: "Pot Bunga Kertas", sellerName: "PaperUp Studio", price: 25000, rating: 4.7, totalSold: 256, materialsUsed: ["Kertas", "Karton"], isRecycled: true, imageUrl: "", category: "Dekorasi" },
  { id: "4", name: "Gantungan Kunci Kaleng", sellerName: "MetalCraft ID", price: 15000, rating: 4.5, totalSold: 312, materialsUsed: ["Aluminium"], isRecycled: true, imageUrl: "", category: "Aksesoris" },
  { id: "5", name: "Lilin Aromaterapi Kaca", sellerName: "GlassGlow", price: 55000, rating: 4.6, totalSold: 67, materialsUsed: ["Kaca"], isRecycled: true, imageUrl: "", category: "Dekorasi" },
  { id: "6", name: "Tote Bag Serat Alami", sellerName: "NaturalWeave", price: 35000, rating: 4.8, totalSold: 198, materialsUsed: ["Serat Alami"], isRecycled: false, imageUrl: "", category: "Fashion" },
];

const CATEGORIES = ["Semua", "Tas", "Aksesoris", "Dekorasi", "Rumah Tangga", "Fashion"];

const PRODUCT_ICONS: Record<string, string> = {
  "Tas": "🛍️",
  "Aksesoris": "💍",
  "Dekorasi": "🪴",
  "Rumah Tangga": "🏠",
  "Fashion": "👜",
  "default": "📦",
};

export default function MarketplacePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [showRecycledOnly, setShowRecycledOnly] = useState(false);

  useEffect(() => {
    // Listen to real products from Firestore
    const q = query(
      collection(db, "marketplace_products"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length > 0) {
        setProducts(snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })));
      } else {
        // Fallback to mock products if Firestore is empty
        setProducts(FALLBACK_PRODUCTS);
      }
      setLoading(false);
    }, () => {
      // On error, use fallback
      setProducts(FALLBACK_PRODUCTS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter((p) => {
    const name = p.name || "";
    const seller = p.sellerName || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || (p.category || "").includes(selectedCategory);
    const matchesRecycled = !showRecycledOnly || p.isRecycled;
    return matchesSearch && matchesCategory && matchesRecycled;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <p className="text-muted-foreground">Temukan produk dari bahan daur ulang & ramah lingkungan</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari produk atau toko..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={showRecycledOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowRecycledOnly(!showRecycledOnly)}
        >
          <Recycle className="mr-1 h-3 w-3" />
          Daur Ulang Saja
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Eco Banner */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardContent className="p-4 flex items-center gap-3">
          <Leaf className="h-8 w-8" />
          <div>
            <p className="font-medium">Setiap pembelian = Dampak Lingkungan</p>
            <p className="text-sm text-green-100">Produk daur ulang membantu mengurangi sampah di TPA</p>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const icon = PRODUCT_ICONS[product.category] || PRODUCT_ICONS.default;
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center text-5xl mb-3 group-hover:scale-105 transition-transform">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    icon
                  )}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium">{product.rating || 0}</span>
                  <span className="text-xs text-muted-foreground">· {product.totalSold || 0} terjual</span>
                </div>
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{product.sellerName || "Seller"}</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-green-600">{formatCurrency(product.price)}</p>
                  {product.isRecycled && (
                    <Badge variant="outline" className="text-xs">
                      <Recycle className="h-3 w-3 mr-1" />
                      Daur Ulang
                    </Badge>
                  )}
                </div>
                {product.materialsUsed && product.materialsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.materialsUsed.map((mat: string) => (
                      <span key={mat} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {mat}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Tidak ditemukan produk untuk &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
