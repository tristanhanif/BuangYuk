import type { ProductCardProps } from "@/components/feature/ProductCard";

export interface Product extends ProductCardProps {
  id: string;
  category: "tas" | "dekorasi" | "alat-tulis" | "lainnya";
  description: string;
  altText: string;
}

export const productsMock: Product[] = [
  {
    id: "p1",
    name: "Tas Belanja Daur Ulang Plastik",
    imageUrl: "https://placehold.co/400x400?text=Tas+Belanja",
    altText: "Tas belanja daur ulang plastik",
    priceRp: 35000,
    pricePoints: 3500,
    sellerName: "UMKM Kreasi Hijau",
    stock: 12,
    category: "tas",
    description:
      "Tas belanja ramah lingkungan yang dibuat dari anyaman plastik bekas kemasan. Kuat, lapang, dan dapat dilipat. Setiap pembelian membantu mendaur ulang sampah plastik menjadi produk bermanfaat.",
  },
  {
    id: "p2",
    name: "Pot Bunga dari Botol Bekas",
    imageUrl: "https://placehold.co/400x400?text=Pot+Bunga",
    altText: "Pot bunga dari botol bekas",
    priceRp: 15000,
    pricePoints: 1500,
    sellerName: "SMK Karya Mandiri",
    stock: 25,
    category: "dekorasi",
    description:
      "Pot bunga cantik yang dibuat dari botol plastik bekas yang dihias dengan cat ramah lingkungan. Cocok untuk menghiasi meja atau taman kecil di rumahmu.",
  },
  {
    id: "p3",
    name: "Notebook Kertas Daur Ulang",
    imageUrl: "https://placehold.co/400x400?text=Notebook",
    altText: "Notebook dari kertas daur ulang",
    priceRp: 20000,
    pricePoints: 2000,
    sellerName: "UMKM Daur Kertas",
    stock: 40,
    category: "alat-tulis",
    description:
      "Notebook bergaya rustic dengan sampul dari kardus bekas dan halaman dari kertas daur ulang. Tinta & jilid ramah lingkungan, nyaman dipakai menulis setiap hari.",
  },
  {
    id: "p4",
    name: "Tempat Pensil Kaleng Bekas",
    imageUrl: "https://placehold.co/400x400?text=Tempat+Pensil",
    altText: "Tempat pensil dari kaleng bekas",
    priceRp: 18000,
    pricePoints: 1800,
    sellerName: "SMK Karya Mandiri",
    stock: 0,
    category: "alat-tulis",
    description:
      "Tempat pensil dari kaleng bekas yang di-upcycle dengan teknik decoupage. Unik dan satu-satunya, setiap produk memiliki pola yang berbeda.",
  },
  {
    id: "p5",
    name: "Gantungan Kunci Tali Bekas",
    imageUrl: "https://placehold.co/400x400?text=Gantungan",
    altText: "Gantungan kunci dari tali bekas",
    priceRp: 10000,
    pricePoints: 1000,
    sellerName: "UMKM Kreasi Hijau",
    stock: 30,
    category: "lainnya",
    description:
      "Gantungan kunci yang dianyam dari tali rafia dan kain perca bekas. Kecil tapi berdampak besar untuk mengurangi sampah tekstil.",
  },
];

export const productCategories = [
  { id: "semua", label: "Semua" },
  { id: "tas", label: "Tas & Aksesoris" },
  { id: "dekorasi", label: "Dekorasi" },
  { id: "alat-tulis", label: "Alat Tulis" },
  { id: "lainnya", label: "Lainnya" },
];
