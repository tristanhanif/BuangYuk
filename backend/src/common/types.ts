// ============================================================
// BuangYuk Backend — Shared Types & Enums
// ============================================================

export type UserRole = "customer" | "collector" | "bank_sampah" | "umkm" | "admin";

// Legacy roles (update.md 5: migrate to canonical)
export type LegacyUserRole = "user" | "verifier" | "admin";

// update.md 29.9: Collector location
export interface CollectorLocation {
  locationId: string;
  collectorId: string;
  pickupId: string | null;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  createdAt: Date;
}

export type PickupStatus =
  | "REQUESTED"
  | "MATCHING"
  | "ASSIGNED"
  | "ACCEPTED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "VERIFYING"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "DISPUTED"
  | "FAILED";

export const PICKUP_STATE_MACHINE: Record<PickupStatus, PickupStatus[]> = {
  REQUESTED: ["MATCHING", "CANCELLED"],
  MATCHING: ["ASSIGNED", "EXPIRED", "CANCELLED"],
  ASSIGNED: ["ACCEPTED", "EXPIRED", "CANCELLED"],
  ACCEPTED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["VERIFYING", "CANCELLED"],
  VERIFYING: ["COMPLETED", "DISPUTED", "FAILED"],
  COMPLETED: ["DISPUTED"],
  CANCELLED: [],
  EXPIRED: ["MATCHING"],
  DISPUTED: ["COMPLETED"],
  FAILED: ["MATCHING"],
};

export type DisputeCategory =
  | "weight"
  | "price"
  | "material"
  | "condition"
  | "pickup"
  | "payment"
  | "other";

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED";

export type DisputeResolution =
  | "customer_favored"
  | "collector_favored"
  | "bank_favored"
  | "partial_adjustment";

export type FraudFlagStatus = "NORMAL" | "FLAGGED" | "UNDER_REVIEW" | "RESOLVED";

export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED";

export type EarningStatus = "PENDING" | "AVAILABLE" | "WITHDRAWN";

export type WasteGrade = "A" | "B" | "C" | "D";

export type WasteCondition = "clean" | "mixed" | "dirty" | "contaminated";

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface MatchingWeights {
  distance: number;
  reliability: number;
  capacity: number;
  availability: number;
  experience: number;
  regionFit: number;
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  distance: 0.25,
  reliability: 0.25,
  capacity: 0.15,
  availability: 0.15,
  experience: 0.10,
  regionFit: 0.10,
};

export interface PricingSnapshot {
  materialId: string;
  grade: WasteGrade;
  condition: WasteCondition;
  regionId: string;
  basePrice: number;
  gradeFactor: number;
  conditionFactor: number;
  regionFactor: number;
  finalPrice: number;
  capturedAt: Date;
}

export interface MatchingSnapshot {
  algorithm: string;
  weights: MatchingWeights;
  score: number;
  candidatesEvaluated: number;
  capturedAt: Date;
}

export interface CommissionConfig {
  marketplaceCommissionRate: number;
  platformGrossSpread: number;
  collectorBaseFee: number;
  collectorCommissionRate: number;
  cashoutMinimum: number;
  cashoutFee: number;
  paymentFeeRate: number;
}
