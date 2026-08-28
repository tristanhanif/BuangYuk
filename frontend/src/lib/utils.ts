import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ECO_LEVELS } from "@/lib/constants";

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

export function calculateCO2Saved(category: string, weightKg: number): number {
  const factors: Record<string, number> = {
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
  return weightKg * (factors[category] || 0);
}

export function calculateEarnings(category: string, weightKg: number): number {
  const prices: Record<string, number> = {
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
  return weightKg * (prices[category] || 0);
}

export function calculatePoints(category: string, weightKg: number): number {
  const points: Record<string, number> = {
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
  return Math.round(weightKg * (points[category] || 0));
}

export function getEcoLevel(totalPoints: number) {
  return (
    ECO_LEVELS.find((l) => totalPoints >= l.minPoints && totalPoints <= l.maxPoints) ||
    ECO_LEVELS[0]
  );
}

export function getNextLevel(currentLevel: number) {
  return ECO_LEVELS.find((l) => l.level === currentLevel + 1);
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