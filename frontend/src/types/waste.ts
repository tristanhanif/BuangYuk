export interface WasteInput {
  categoryId: string;
  quantity: number;
  unit: "kg" | "pcs" | "liter" | "m3";
  standardizedWeightKg: number;
  estimatedEarnings: number;
  estimatedCO2Saved: number;
  estimatedPoints: number;
}

export interface WasteItem {
  id: string;
  categoryId: string;
  categoryLabel: string;
  quantity: number;
  unit: string;
  weightKg: number;
  earnings: number;
  co2Saved: number;
  points: number;
}

export interface WasteSubmission {
  items: WasteInput[];
  pickupMethod: "pickup" | "dropoff";
  address?: string;
  bankSampahId?: string;
  photos: File[];
  notes?: string;
}