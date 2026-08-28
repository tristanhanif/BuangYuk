"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package, ShoppingCart, TrendingUp, Plus, Truck, CheckCircle2,
  Clock, Loader2, X,
} from "lucide-react";

export default function UMKMDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", stock: "", category: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const prodUnsub = onSnapshot(
      query(collection(db, "marketplace_products"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc")),
      (snapshot) => {
        setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const orderUnsub = onSnapshot(
      query(collection(db, "marketplace_orders"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc")),
      (snapshot) => {
        setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date() })));
        setLoading(false);
      }
    );

    return () => { prodUnsub(); orderUnsub(); };
  }, [user]);

  const handleAddProduct = useCallback(async () => {
    if (!user || !newProduct.name || !newProduct.price) return;
    setAdding(true);
    try {
      await addDoc(collection(db, "marketplace_products"), {
        sellerId: user.uid,
        sellerName: user.displayName || "UMKM",
        name: newProduct.name,
        description: newProduct.description,
        price: parseInt(newProduct.price),
        category: newProduct.category || "Umum",
        imageUrl: "",
        additionalImages: [],
        stock: parseInt(newProduct.stock) || 10,
        materialsUsed: [],
        isRecycled: true,
        regionId: "bandung",
        isActive: true,
        rating: 0,
        totalSold: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewProduct({ name: "", price: "", description: "", stock: "", category: "" });
      setShowAddProduct(false);
    } catch {
      alert("Gagal menambah produk");
    } finally {
      setAdding(false);
    }
  }, [user, newProduct]);

  if (authLoading || loading) {
    return <div className="space-y-6 animate-pulse"><div className="h-8 bg-muted rounded w-1/4" /><div className="h-32 bg-muted rounded-xl" /></div>;
  }

  if (!user) {
    return <div className="text-center py-12"><h1 className="text-2xl font-bold mb-4">Silakan login</h1><a href="/login" className="text-primary hover:underline">Login</a></div>;
  }

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.sellerReceives || 0), 0);
  const pendingOrders = orders.filter((o: any) => ["PAID", "PROCESSING"].includes(o.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">UMKM Dashboard</h1>
          <p className="text-muted-foreground">Kelola produk, pesanan, dan pengiriman</p>
        </div>
        <Button onClick={() => setShowAddProduct(!showAddProduct)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Add Product Form */}
      {showAddProduct && (
        <Card className="border-green-200">
          <CardHeader><CardTitle className="text-lg">Tambah Produk Baru</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Tas Daur Ulang" />
              </div>
              <div className="space-y-2">
                <Label>Harga (Rp)</Label>
                <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="45000" />
              </div>
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Aksesoris" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Deskripsi produk..."
                className="w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddProduct(false)} className="flex-1">Batal</Button>
              <Button onClick={handleAddProduct} disabled={adding || !newProduct.name || !newProduct.price} className="flex-1">
                {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Simpan Produk
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Package className="h-6 w-6 mx-auto text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{products.length}</p>
          <p className="text-xs text-muted-foreground">Produk Aktif</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <ShoppingCart className="h-6 w-6 mx-auto text-green-600 mb-2" />
          <p className="text-2xl font-bold">{pendingOrders.length}</p>
          <p className="text-xs text-muted-foreground">Pesanan Baru</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Truck className="h-6 w-6 mx-auto text-amber-600 mb-2" />
          <p className="text-2xl font-bold">{orders.filter((o: any) => o.status === "SHIPPED").length}</p>
          <p className="text-xs text-muted-foreground">Dikirim</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto text-purple-600 mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Revenue</p>
        </CardContent></Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Pesanan Terbaru</CardTitle></CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Belum ada pesanan</p></div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 10).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{order.buyerName}</p>
                    <p className="text-xs text-muted-foreground">{order.productName} × {order.quantity}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(order.sellerReceives)}</p>
                    <Badge variant={
                      order.status === "COMPLETED" ? "success" :
                      order.status === "SHIPPED" ? "info" :
                      order.status === "PROCESSING" ? "warning" : "success"
                    } className="text-xs">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Produk Saya ({products.length})</CardTitle></CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Belum ada produk</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="p-4 rounded-xl border border-border hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">🛍️</div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-sm text-green-600 font-medium">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-muted-foreground">Stok: {product.stock}</p>
                  <Badge variant={product.isActive ? "success" : "secondary"} className="text-xs mt-2">
                    {product.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
