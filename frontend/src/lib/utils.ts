import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WASTE_CATEGORIES, VALIDATION_RULES, type WasteCategory } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDate(d);
}

function getCategory(categoryId: string): WasteCategory | undefined {
  return WASTE_CATEGORIES.find(c => c.id === categoryId);
}

export function calculateCO2Saved(categoryId: string, weightKg: number): number {
  const cat = getCategory(categoryId);
  return weightKg * (cat?.co2Factor || 0);
}

export function calculateEarnings(categoryId: string, weightKg: number): number {
  const cat = getCategory(categoryId);
  return Math.round(weightKg * (cat?.pricePerKg || 0));
}

export function calculatePoints(categoryId: string, weightKg: number): number {
  const cat = getCategory(categoryId);
  return Math.round(weightKg * (cat?.pointsPerKg || 0));
}

export interface AnomalyFlag {
  type: "weight" | "density" | "price" | "category";
  severity: "warning" | "error";
  message: string;
  field?: string;
}

export function validateTransactionItem(
  categoryId: string,
  weightKg: number,
  unit: "kg" | "pcs",
  quantity: number
): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];
  const cat = getCategory(categoryId);
  const rules = VALIDATION_RULES;

  if (!cat) {
    flags.push({
      type: "category",
      severity: "error",
      message: `Kategori tidak dikenal: ${categoryId}`,
      field: "categoryId",
    });
    return flags;
  }

  if (weightKg < rules.minWeightKg) {
    flags.push({
      type: "weight",
      severity: "error",
      message: `Berat terlalu kecil: ${weightKg} kg (min ${rules.minWeightKg} kg)`,
      field: "weightKg",
    });
  }

  if (weightKg > rules.maxSingleItemWeightKg) {
    flags.push({
      type: "weight",
      severity: "warning",
      message: `Berat item melebihi batas normal: ${weightKg} kg (max ${rules.maxSingleItemWeightKg} kg)`,
      field: "weightKg",
    });
  }

  if (cat.unit === "pcs" && cat.typicalWeightPerPcsKg) {
    const expectedWeight = quantity * cat.typicalWeightPerPcsKg;
    const diffPercent = Math.abs(weightKg - expectedWeight) / expectedWeight * 100;
    if (diffPercent > rules.densityTolerancePercent) {
      flags.push({
        type: "density",
        severity: "warning",
        message: `Berat tidak sesuai estimasi: ${weightKg.toFixed(3)} kg vs ~${expectedWeight.toFixed(3)} kg (${diffPercent.toFixed(0)}% selisih)`,
        field: "weightKg",
      });
    }
  }

  if (cat.densityKgPerM3 && unit === "kg") {
    const volumeM3 = weightKg / cat.densityKgPerM3;
    if (volumeM3 > 10) {
      flags.push({
        type: "density",
        severity: "warning",
        message: `Volume sangat besar: ${volumeM3.toFixed(1)} m³ untuk ${weightKg} kg ${cat.label}`,
        field: "weightKg",
      });
    }
  }

  return flags;
}

export function validateTotalWeight(totalWeightKg: number): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];
  const rules = VALIDATION_RULES;

  if (totalWeightKg > rules.maxTotalWeightKg) {
    flags.push({
      type: "weight",
      severity: "warning",
      message: `Total berat transaksi melebihi batas normal: ${totalWeightKg} kg (max ${rules.maxTotalWeightKg} kg)`,
      field: "totalWeightKg",
    });
  }

  return flags;
}

export function getEcoLevel(totalPoints: number) {
  const levels = [
    { level: 1, name: "Pemula Hijau", minPoints: 0, maxPoints: 99, badge: "🌱" },
    { level: 2, name: "Penjaga Bumi", minPoints: 100, maxPoints: 499, badge: "🌿" },
    { level: 3, name: "Pahlawan Daur Ulang", minPoints: 500, maxPoints: 1999, badge: "♻️" },
    { level: 4, name: "Plastic Fighter", minPoints: 2000, maxPoints: 4999, badge: "🥤" },
    { level: 5, name: "E-Waste Pioneer", minPoints: 5000, maxPoints: 9999, badge: "💻" },
    { level: 6, name: "Carbon Neutral Champion", minPoints: 10000, maxPoints: Infinity, badge: "🌍" },
  ];
  return levels.find(l => totalPoints >= l.minPoints && totalPoints <= l.maxPoints) || levels[0];
}

export function getNextLevel(currentLevel: number) {
  const levels = [
    { level: 1, name: "Pemula Hijau", minPoints: 0, maxPoints: 99, badge: "🌱" },
    { level: 2, name: "Penjaga Bumi", minPoints: 100, maxPoints: 499, badge: "🌿" },
    { level: 3, name: "Pahlawan Daur Ulang", minPoints: 500, maxPoints: 1999, badge: "♻️" },
    { level: 4, name: "Plastic Fighter", minPoints: 2000, maxPoints: 4999, badge: "🥤" },
    { level: 5, name: "E-Waste Pioneer", minPoints: 5000, maxPoints: 9999, badge: "💻" },
    { level: 6, name: "Carbon Neutral Champion", minPoints: 10000, maxPoints: Infinity, badge: "🌍" },
  ];
  return levels.find(l => l.level === currentLevel + 1);
}

export function compressImage(file: File, maxWidth = 1024, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

export function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function co2Comparator(kgCO2: number): string {
  const trees = (kgCO2 / 22).toFixed(1);
  const kwh = (kgCO2 / 2.38).toFixed(1);
  const kmCar = (kgCO2 / 2.2).toFixed(1);
  const literPetrol = (kgCO2 / 2.3).toFixed(2);
  return `≈ ${trees} pohon-tahun | ${kwh} kWh listrik | ${kmCar} km mobil | ${literPetrol} L bensin`;
}