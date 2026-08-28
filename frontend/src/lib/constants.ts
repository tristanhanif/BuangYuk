export interface WasteCategory {
  id: string;
  label: string;
  icon: string;
  unit: "kg" | "pcs";
  color: string;
  pricePerKg: number;
  co2Factor: number;
  pointsPerKg: number;
  emissionFactorSource: string;
  densityKgPerM3?: number;
  typicalWeightPerPcsKg?: number;
}

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: "paper-cardboard",
    label: "Kertas & Karton",
    icon: "📄",
    unit: "kg",
    color: "bg-green-100 text-green-700",
    pricePerKg: 2500,
    co2Factor: 3.10,
    pointsPerKg: 10,
    emissionFactorSource: "EPA WARM v15 - Mixed Paper",
    densityKgPerM3: 150,
  },
  {
    id: "plastic-pet",
    label: "Plastik PET (Botol)",
    icon: "🥤",
    unit: "kg",
    color: "bg-blue-100 text-blue-700",
    pricePerKg: 5000,
    co2Factor: 2.10,
    pointsPerKg: 15,
    emissionFactorSource: "EPA WARM v15 - PET",
    densityKgPerM3: 300,
    typicalWeightPerPcsKg: 0.025,
  },
  {
    id: "plastic-hdpe",
    label: "Plastik HDPE (Galon)",
    icon: "🛢️",
    unit: "kg",
    color: "bg-blue-100 text-blue-700",
    pricePerKg: 5000,
    co2Factor: 1.80,
    pointsPerKg: 15,
    emissionFactorSource: "EPA WARM v15 - HDPE",
    densityKgPerM3: 250,
    typicalWeightPerPcsKg: 0.050,
  },
  {
    id: "plastic-pp",
    label: "Plastik PP (Tutup)",
    icon: "🔵",
    unit: "kg",
    color: "bg-blue-100 text-blue-700",
    pricePerKg: 3500,
    co2Factor: 1.70,
    pointsPerKg: 12,
    emissionFactorSource: "EPA WARM v15 - PP",
    densityKgPerM3: 200,
    typicalWeightPerPcsKg: 0.005,
  },
  {
    id: "plastic-ldpe",
    label: "Plastik LDPE (Kantong)",
    icon: "🛍️",
    unit: "kg",
    color: "bg-blue-100 text-blue-700",
    pricePerKg: 2500,
    co2Factor: 1.60,
    pointsPerKg: 10,
    emissionFactorSource: "EPA WARM v15 - LDPE",
    densityKgPerM3: 150,
    typicalWeightPerPcsKg: 0.010,
  },
  {
    id: "plastic-mixed",
    label: "Plastik Campuran",
    icon: "🗑️",
    unit: "kg",
    color: "bg-gray-100 text-gray-700",
    pricePerKg: 1500,
    co2Factor: 1.50,
    pointsPerKg: 8,
    emissionFactorSource: "EPA WARM v15 - Mixed Plastics",
    densityKgPerM3: 180,
  },
  {
    id: "metal-aluminum",
    label: "Aluminium (Kaleng)",
    icon: "♻️",
    unit: "kg",
    color: "bg-slate-100 text-slate-700",
    pricePerKg: 15000,
    co2Factor: 8.90,
    pointsPerKg: 50,
    emissionFactorSource: "EPA WARM v15 - Aluminum Cans",
    densityKgPerM3: 2700,
    typicalWeightPerPcsKg: 0.015,
  },
  {
    id: "metal-steel",
    label: "Besi & Baja",
    icon: "🔩",
    unit: "kg",
    color: "bg-slate-100 text-slate-700",
    pricePerKg: 3000,
    co2Factor: 1.80,
    pointsPerKg: 20,
    emissionFactorSource: "EPA WARM v15 - Steel Cans",
    densityKgPerM3: 7800,
  },
  {
    id: "metal-mixed",
    label: "Logam Campuran",
    icon: "🔧",
    unit: "kg",
    color: "bg-slate-100 text-slate-700",
    pricePerKg: 5000,
    co2Factor: 2.50,
    pointsPerKg: 25,
    emissionFactorSource: "EPA WARM v15 - Mixed Metals",
    densityKgPerM3: 5000,
  },
  {
    id: "glass",
    label: "Kaca",
    icon: "🍾",
    unit: "kg",
    color: "bg-amber-100 text-amber-700",
    pricePerKg: 500,
    co2Factor: 0.30,
    pointsPerKg: 5,
    emissionFactorSource: "EPA WARM v15 - Glass",
    densityKgPerM3: 2500,
    typicalWeightPerPcsKg: 0.300,
  },
  {
    id: "ewaste-general",
    label: "E-Waste Umum",
    icon: "📱",
    unit: "pcs",
    color: "bg-purple-100 text-purple-700",
    pricePerKg: 25000,
    co2Factor: 1.20,
    pointsPerKg: 100,
    emissionFactorSource: "EPA WARM v15 - Electronics",
    typicalWeightPerPcsKg: 0.200,
  },
  {
    id: "ewaste-cpu",
    label: "CPU / Processor",
    icon: "💻",
    unit: "pcs",
    color: "bg-purple-100 text-purple-700",
    pricePerKg: 50000,
    co2Factor: 2.50,
    pointsPerKg: 200,
    emissionFactorSource: "EPA WARM v15 - Desktop CPU",
    typicalWeightPerPcsKg: 0.500,
  },
  {
    id: "ewaste-screen",
    label: "Layar / Monitor",
    icon: "🖥️",
    unit: "pcs",
    color: "bg-purple-100 text-purple-700",
    pricePerKg: 30000,
    co2Factor: 1.50,
    pointsPerKg: 150,
    emissionFactorSource: "EPA WARM v15 - CRT/LCD Monitor",
    typicalWeightPerPcsKg: 5.000,
  },
  {
    id: "ewaste-cable",
    label: "Kabel & Aksesoris",
    icon: "🔌",
    unit: "kg",
    color: "bg-purple-100 text-purple-700",
    pricePerKg: 20000,
    co2Factor: 1.80,
    pointsPerKg: 80,
    emissionFactorSource: "EPA WARM v15 - Cables",
    densityKgPerM3: 3000,
  },
  {
    id: "ewaste-battery",
    label: "Baterai",
    icon: "🔋",
    unit: "pcs",
    color: "bg-red-100 text-red-700",
    pricePerKg: 10000,
    co2Factor: 3.00,
    pointsPerKg: 50,
    emissionFactorSource: "EPA WARM v15 - Batteries",
    typicalWeightPerPcsKg: 0.050,
  },
  {
    id: "organic",
    label: "Organik (Kompos)",
    icon: "🌱",
    unit: "kg",
    color: "bg-green-100 text-green-700",
    pricePerKg: 500,
    co2Factor: 0.20,
    pointsPerKg: 5,
    emissionFactorSource: "IPCC 2006 - Composting",
    densityKgPerM3: 400,
  },
  {
    id: "tetrapak",
    label: "Tetrapak / Karton Susu",
    icon: "🥛",
    unit: "kg",
    color: "bg-orange-100 text-orange-700",
    pricePerKg: 2000,
    co2Factor: 1.20,
    pointsPerKg: 10,
    emissionFactorSource: "EPA WARM v15 - Aseptic Cartons",
    densityKgPerM3: 200,
    typicalWeightPerPcsKg: 0.030,
  },
  {
    id: "textile",
    label: "Tekstil / Pakaian",
    icon: "👕",
    unit: "kg",
    color: "bg-pink-100 text-pink-700",
    pricePerKg: 3000,
    co2Factor: 2.30,
    pointsPerKg: 15,
    emissionFactorSource: "EPA WARM v15 - Mixed Textiles",
    densityKgPerM3: 150,
  },
];

export const UNIT_CONVERSIONS: Record<string, { toKg: number; label: string }> = {
  kg: { toKg: 1, label: "kg" },
  pcs: { toKg: 1, label: "pcs" },
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

export const ECO_LEVELS = [
  { level: 1, name: "Pemula Hijau", minPoints: 0, maxPoints: 99, badge: "🌱" },
  { level: 2, name: "Penjaga Bumi", minPoints: 100, maxPoints: 499, badge: "🌿" },
  { level: 3, name: "Pahlawan Daur Ulang", minPoints: 500, maxPoints: 1999, badge: "♻️" },
  { level: 4, name: "Plastic Fighter", minPoints: 2000, maxPoints: 4999, badge: "🥤" },
  { level: 5, name: "E-Waste Pioneer", minPoints: 5000, maxPoints: 9999, badge: "💻" },
  { level: 6, name: "Carbon Neutral Champion", minPoints: 10000, maxPoints: Infinity, badge: "🌍" },
];

export const VALIDATION_RULES = {
  maxWeightDiffPercent: 10,
  maxSingleItemWeightKg: 100,
  maxTotalWeightKg: 500,
  minWeightKg: 0.01,
  densityTolerancePercent: 50,
};

export function getCategoryById(id: string): WasteCategory | undefined {
  return WASTE_CATEGORIES.find(c => c.id === id);
}

export function getCategoriesByUnit(unit: "kg" | "pcs"): WasteCategory[] {
  return WASTE_CATEGORIES.filter(c => c.unit === unit);
}