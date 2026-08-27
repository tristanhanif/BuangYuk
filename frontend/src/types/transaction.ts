export type TransactionStatus = "PENDING" | "VERIFIED" | "REJECTED" | "COMPLETED";

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: TransactionItem[];
  pickupMethod: "pickup" | "dropoff";
  address?: string;
  bankSampahId?: string;
  photos: string[];
  status: TransactionStatus;
  totalWeightKg: number;
  totalEarnings: number;
  totalCO2Saved: number;
  totalPoints: number;
  verifierId?: string;
  verifierName?: string;
  verifiedWeightKg?: number;
  verifiedEarnings?: number;
  verifiedCO2Saved?: number;
  verifiedPoints?: number;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
}

export interface TransactionItem {
  categoryId: string;
  categoryLabel: string;
  quantity: number;
  unit: string;
  weightKg: number;
  earnings: number;
  co2Saved: number;
  points: number;
  verifiedWeightKg?: number;
  verifiedEarnings?: number;
  verifiedCO2Saved?: number;
  verifiedPoints?: number;
}

export interface VerificationData {
  transactionId: string;
  actualWeightKg: number;
  actualCategoryId?: string;
  notes?: string;
  action: "approve" | "adjust" | "reject";
}