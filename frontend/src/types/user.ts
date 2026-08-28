export type UserRole = "customer" | "collector" | "bank_sampah" | "umkm" | "admin" | "user" | "verifier";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  regionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  ecoPoints: number;
  totalCO2Saved: number;
  totalTransactions: number;
  currentLevel: number;
  levelName: string;
  badge: string;
}

export interface EcoSummary {
  userId: string;
  totalCO2Saved: number;
  totalEcoPoints: number;
  totalTransactions: number;
  wasteBreakdown: Record<string, number>;
  monthlyCO2Trend: Array<{ month: string; co2: number }>;
  lastUpdated: Date;
}

export interface WasteCategory {
  id: string;
  label: string;
  icon: string;
  unit: "kg" | "pcs" | "liter" | "m3";
  color: string;
  emissionFactor: number;
  pricePerKg: number;
  pointsPerKg: number;
}