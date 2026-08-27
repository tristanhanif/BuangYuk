export const EMISSION_FACTORS: Record<string, number> = {
  "kertas": 3.3,
  "karton": 3.3,
  "plastik-pet": 2.5,
  "plastik-hdpe": 1.8,
  "plastik-pp": 1.8,
  "plastik-ldpe": 1.8,
  "plastik-campur": 1.5,
  "logam-aluminium": 8.8,
  "logam-besi": 1.7,
  "logam-kaca": 0.3,
  "e-waste-portabel": 1.2,
  "cpu": 1.5,
  "layar": 0.8,
  "kabel": 2.1,
  "baterai": 4.5,
};

export const WASTE_CATEGORIES = [
  { id: "kertas", label: "Kertas & Karton", icon: "📄", unit: "kg", color: "bg-green-100 text-green-700" },
  { id: "plastik-pet", label: "Plastik PET (Botol)", icon: "🥤", unit: "kg", color: "bg-blue-100 text-blue-700" },
  { id: "plastik-hdpe", label: "Plastik HDPE (Galon)", icon: "🛢️", unit: "kg", color: "bg-blue-100 text-blue-700" },
  { id: "plastik-pp", label: "Plastik PP (Tutup)", icon: "🔵", unit: "kg", color: "bg-blue-100 text-blue-700" },
  { id: "plastik-ldpe", label: "Plastik LDPE (Kantong)", icon: "🛍️", unit: "kg", color: "bg-blue-100 text-blue-700" },
  { id: "plastik-campur", label: "Plastik Campur", icon: "🗑️", unit: "kg", color: "bg-gray-100 text-gray-700" },
  { id: "logam-aluminium", label: "Aluminium (Kaleng)", icon: "♻️", unit: "kg", color: "bg-slate-100 text-slate-700" },
  { id: "logam-besi", label: "Besi & Baja", icon: "🔩", unit: "kg", color: "bg-slate-100 text-slate-700" },
  { id: "logam-kaca", label: "Kaca", icon: "🍾", unit: "kg", color: "bg-amber-100 text-amber-700" },
  { id: "e-waste-portabel", label: "E-Waste Portabel", icon: "📱", unit: "pcs", color: "bg-purple-100 text-purple-700" },
  { id: "cpu", label: "CPU / Komputer", icon: "💻", unit: "pcs", color: "bg-purple-100 text-purple-700" },
  { id: "layar", label: "Layar / Monitor", icon: "🖥️", unit: "pcs", color: "bg-purple-100 text-purple-700" },
  { id: "kabel", label: "Kabel & Aksesoris", icon: "🔌", unit: "kg", color: "bg-purple-100 text-purple-700" },
  { id: "baterai", label: "Baterai", icon: "🔋", unit: "pcs", color: "bg-red-100 text-red-700" },
];

export const PRICE_PER_KG: Record<string, number> = {
  "kertas": 2000,
  "karton": 1800,
  "plastik-pet": 4000,
  "plastik-hdpe": 5000,
  "plastik-pp": 3500,
  "plastik-ldpe": 2500,
  "plastik-campur": 1500,
  "logam-aluminium": 15000,
  "logam-besi": 3000,
  "logam-kaca": 500,
  "e-waste-portabel": 25000,
  "cpu": 50000,
  "layar": 30000,
  "kabel": 20000,
  "baterai": 10000,
};

export const POINTS_PER_KG: Record<string, number> = {
  "kertas": 10,
  "karton": 10,
  "plastik-pet": 15,
  "plastik-hdpe": 15,
  "plastik-pp": 12,
  "plastik-ldpe": 10,
  "plastik-campur": 8,
  "logam-aluminium": 50,
  "logam-besi": 20,
  "logam-kaca": 5,
  "e-waste-portabel": 100,
  "cpu": 200,
  "layar": 150,
  "kabel": 80,
  "baterai": 50,
};

export const ECO_LEVELS = [
  { level: 1, name: "Pemula Hijau", minPoints: 0, maxPoints: 99, badge: "🌱" },
  { level: 2, name: "Penjaga Bumi", minPoints: 100, maxPoints: 499, badge: "🌿" },
  { level: 3, name: "Pahlawan Daur Ulang", minPoints: 500, maxPoints: 1999, badge: "♻️" },
  { level: 4, name: "Plastic Fighter", minPoints: 2000, maxPoints: 4999, badge: "🥤" },
  { level: 5, name: "E-Waste Pioneer", minPoints: 5000, maxPoints: 9999, badge: "💻" },
  { level: 6, name: "Carbon Neutral Champion", minPoints: 10000, maxPoints: Infinity, badge: "🌍" },
];

export const UNIT_CONVERSIONS: Record<string, { toKg: number; label: string }> = {
  "kg": { toKg: 1, label: "kg" },
  "pcs": { toKg: 0.1, label: "pcs" },
  "liter": { toKg: 0.02, label: "liter" },
  "m3": { toKg: 100, label: "m³" },
};

export const PICKUP_METHODS = [
  { id: "pickup", label: "Dijemput Petugas", icon: "🚛", description: "Petugas akan mengambil di alamat Anda" },
  { id: "dropoff", label: "Antar ke Bank Sampah", icon: "🏪", description: "Anda mengantarkan ke bank sampah terdekat" },
];

export const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
} as const;

export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];