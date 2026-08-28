// ============================================================
// BuangYuk Platform — Full Type Definitions
// Based on update.md PRD v1.0
// ============================================================

// --- Enums & Constants ---

export type UserRole = "customer" | "collector" | "bank_sampah" | "umkm" | "admin";

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
  | "FAILED"
  | "REASSIGNED";

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
  | "customer_favor"
  | "collector_favor"
  | "bank_favor"
  | "partial"
  | "rejected";

export type FraudFlagStatus = "FLAGGED" | "UNDER_REVIEW" | "CONFIRMED" | "CLEARED";

export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED";

export type EarningStatus = "PENDING" | "AVAILABLE" | "WITHDRAWAL";

export type WasteGrade = "A" | "B" | "C" | "D";

export type WasteCondition = "clean" | "mixed" | "dirty" | "contaminated";

export type AvailabilityStatus = "available" | "busy" | "offline" | "suspended";

export type ReliabilityStatus = "normal" | "warning" | "suspended" | "review";

// --- User & Profile ---

export interface User {
  uid: string;
  email: string;
  fullName: string;  // update.md uses fullName
  profilePhotoUrl?: string;  // update.md uses profilePhotoUrl
  role: UserRole;
  phoneNumber?: string;
  address?: Record<string, unknown>;  // update.md uses address as Object
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

// --- Collector Profile (update.md 29.8) ---

export interface CollectorProfile {
  collectorId: string;
  userId: string;
  availabilityStatus: AvailabilityStatus;  // update.md
  serviceRegions: string[];  // update.md: array of regions
  currentLocation: { lat: number; lng: number } | null;
  reliabilityScore: number;  // 0-100
  reliabilityStatus: ReliabilityStatus;  // update.md
  dailyCapacity: number;
  currentLoad: number;
  totalCompletedPickups: number;
  totalCancelledPickups: number;
  suspendedUntil: Date | null;  // update.md
  createdAt: Date;
  updatedAt: Date;
}

// --- Collector Location (update.md 29.9) ---

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

// --- Bank Sampah (update.md 29.11) ---

export interface WasteBank {
  bankId: string;
  name: string;
  regionId: string;
  address: string;
  location: { lat: number; lng: number };
  acceptedMaterials: string[];
  dailyCapacityKg: number;
  usedCapacityKg: number;
  operationalStatus: "active" | "inactive" | "full";
  pricingConfigId: string | null;
  contactInfo: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// --- Bank Settlement (update.md 29.12) ---

export interface WasteBankSettlement {
  settlementId: string;
  bankId: string;
  transactionId: string;
  customerWasteValue: number;
  bankPurchaseValue: number;
  grossSpread: number;
  collectorCost: number;
  paymentFee: number;
  operationalCost: number;
  otherCost: number;
  settlementStatus: "pending" | "confirmed" | "settled";
  settlementDate: Date | null;
  createdAt: Date;
}

// --- Eco Summary ---

export interface EcoSummary {
  userId: string;
  totalVerifiedWeightKg: number;  // update.md
  totalCo2eSavedKg: number;  // update.md: Estimated CO₂e Avoided
  totalEcoPoints: number;
  totalCashEarned: number;  // update.md
  badgeLevel: string;  // update.md
  lastUpdated: Date;
}

// --- Pickup (update.md 29.7) ---

export interface Pickup {
  pickupId: string;
  transactionId: string | null;  // update.md: links to waste_transactions
  customerId: string;
  collectorId: string | null;
  regionId: string;
  status: PickupStatus;
  pickupLocation: GeoLocation;
  pickupAddress: string;
  wasteItems: PickupWasteItem[];
  estimatedWeight: number;
  verifiedWeight: number | null;
  estimatedValue: number;
  finalValue: number | null;
  pricingSnapshot: PricingSnapshot | null;
  carbonFactorSnapshot: Record<string, unknown> | null;
  proofPhotoUrls: string[];
  verificationPhotoUrls: string[];
  notes: string | null;
  requestedAt: Date;
  assignedAt: Date | null;
  acceptedAt: Date | null;
  enRouteAt: Date | null;  // update.md
  arrivedAt: Date | null;
  verificationStartedAt: Date | null;  // update.md
  completedAt: Date | null;
  acceptanceDeadline: Date | null;  // update.md: 60 sec from assignment
  reassignmentCount: number;  // update.md
  estimatedDistance: number | null;  // update.md
  actualDistance: number | null;  // update.md
  collectorFee: number;
  platformMargin: number;
  bankPurchaseValue: number;
  disputeId: string | null;  // update.md
  customerConfirmation: boolean | null;  // update.md
  weightDeviationPercent: number | null;  // update.md
  createdAt: Date;
  updatedAt: Date;
}

export interface PickupWasteItem {
  categoryId: string;
  categoryLabel: string;
  quantity: number;
  unit: string;
  weightKg: number;
  grade?: WasteGrade;
  condition?: WasteCondition;
  material?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

// --- Waste Transaction (update.md 29.6) ---

export interface WasteTransaction {
  id: string;
  userId: string;
  status: string;
  categoryId: string;
  subCategoryId: string;
  inputQuantity: number;
  inputUnit: string;
  estimatedCo2eSaved: number;
  photoProofUrl: string;
  pickupMethod: string;
  verifiedWeightKg: number | null;
  verifiedCo2eSaved: number | null;
  earnedCash: number | null;
  earnedEcoPoints: number | null;
  verifierId: string | null;
  verifierNote: string | null;
  pickupId: string | null;  // update.md
  collectorId: string | null;  // update.md
  bankId: string | null;  // update.md
  regionId: string | null;  // update.md
  verificationStatus: string | null;  // update.md
  customerConfirmation: boolean | null;  // update.md
  weightDeviationPercent: number | null;  // update.md
  pricingSnapshot: PricingSnapshot | null;  // update.md
  carbonFactorSnapshot: Record<string, unknown> | null;  // update.md
  disputeId: string | null;  // update.md
  completedAt: Date | null;  // update.md
  createdAt: Date;
  verifiedAt: Date | null;
}

// --- Matching Config (update.md 29.22) ---

export interface MatchingConfig {
  configId: string;
  distanceWeight: number;  // 25
  reliabilityWeight: number;  // 25
  availabilityWeight: number;  // 15
  capacityWeight: number;  // 15
  acceptanceWeight: number;  // 10
  otherWeight: number;  // 10
  acceptanceTimeoutSeconds: number;  // 60
  nearRadiusMeters: number;  // 500
  arrivedRadiusMeters: number;  // 100
  isActive: boolean;
  updatedAt: Date;
}

// --- Pricing ---

export interface PricingConfig {
  configId: string;  // update.md
  regionId: string;
  materialId: string;
  basePrice: number;
  gradeFactors: Record<WasteGrade, number>;  // update.md: object
  conditionFactors: Record<WasteCondition, number>;  // update.md: object
  regionFactor: number;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  isActive: boolean;  // update.md
  updatedBy: string;  // update.md
  updatedAt: Date;
}

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

export interface MatchingWeights {
  distance: number;
  reliability: number;
  capacity: number;
  availability: number;
  experience: number;
  regionFit: number;
}

// --- Carbon Factor (update.md 29.23) ---

export interface CarbonFactor {
  factorId: string;
  material: string;
  emissionFactor: number;
  unit: string;
  source: string;
  methodology: string;
  version: string;
  effectiveDate: Date;
  lastUpdated: Date;
  dataQuality: "high" | "medium" | "low" | "tbd";
  confidence: string;  // update.md
  isActive: boolean;  // update.md
}

// --- Wallet (update.md 29.13) ---

export interface Wallet {
  walletId: string;
  userId: string;
  cashBalance: number;  // update.md: cashBalance
  ecoPointsBalance: number;  // update.md: ecoPointsBalance
  currency: string;
  status: "active" | "suspended";  // update.md
  updatedAt: Date;
}

// --- Wallet Transaction (update.md 29.14) ---

export interface WalletTransaction {
  walletTransactionId: string;  // update.md
  walletId: string;
  userId: string;
  type: "credit_waste" | "cashout" | "marketplace_payment" | "refund" | "adjustment";  // update.md
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;  // update.md
  referenceId: string;  // update.md
  status: "completed" | "pending" | "failed";
  createdAt: Date;
}

// --- Collector Earnings (update.md 29.10) ---

export interface CollectorEarning {
  earningId: string;  // update.md
  collectorId: string;
  pickupId: string;
  baseFee: number;
  commission: number;
  grossEarning: number;  // update.md
  status: EarningStatus;
  pendingUntil: Date;  // update.md
  availableAt: Date | null;
  withdrawalId: string | null;  // update.md
  createdAt: Date;
}

// --- Marketplace ---

export interface MarketplaceProduct {
  productId: string;
  sellerId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];  // update.md
  status: "active" | "inactive" | "sold_out";
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceOrder {
  orderId: string;
  customerId: string;  // update.md: customerId
  sellerId: string;
  items: OrderItem[];
  productValue: number;  // update.md
  commissionRate: number;
  commissionAmount: number;  // update.md
  sellerReceivable: number;  // update.md
  shippingFee: number;
  totalAmount: number;  // update.md
  paymentStatus: string;  // update.md
  orderStatus: OrderStatus;  // update.md
  deliveredAt: Date | null;
  autoCompleteAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// --- Dispute (update.md 29.18) ---

export interface Dispute {
  disputeId: string;
  referenceType: string;  // update.md
  referenceId: string;  // update.md
  createdBy: string;  // update.md
  category: DisputeCategory;
  description: string;
  evidence: DisputeEvidence[];  // update.md: structured
  status: DisputeStatus;
  slaDeadline: Date;  // update.md
  resolutionType: DisputeResolution | null;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

export interface DisputeEvidence {
  type: "photo" | "document" | "text";
  url?: string;
  content?: string;
}

// --- Fraud Flag (update.md 29.19) ---

export interface FraudFlag {
  flagId: string;
  referenceType: string;  // update.md
  referenceId: string;  // update.md
  userId: string;  // update.md
  ruleCode: string;  // update.md
  severity: "low" | "medium" | "high";
  reason: string;  // update.md
  status: FraudFlagStatus;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

// --- Audit Log (update.md 29.24) ---

export interface AuditLog {
  logId: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;  // update.md: resourceType
  resourceId: string;  // update.md: resourceId
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  timestamp: Date;
  ipHash: string | null;  // update.md
  userAgent: string | null;  // update.md
}

// --- Notification (update.md 29.20) ---

export interface Notification {
  notificationId: string;  // update.md
  recipientId: string;  // update.md
  type: string;
  title: string;
  body: string;
  referenceType: string;  // update.md
  referenceId: string;  // update.md
  channel: "fcm" | "in_app";  // update.md
  readAt: Date | null;
  createdAt: Date;
}

// --- Admin Config (update.md) ---

export interface SystemConfig {
  configId: string;
  key: string;
  value: unknown;
  description: string;
  updatedBy: string;
  updatedAt: Date;
}

// --- Map Provider Abstraction (update.md 32) ---

export interface MapProvider {
  renderMap(container: HTMLElement, options: MapOptions): void;
  addMarker(position: GeoLocation, options?: MarkerOptions): Marker;
  calculateDistance(from: GeoLocation, to: GeoLocation): number;
  getRoute(from: GeoLocation, to: GeoLocation): Promise<Route>;
  geocode(address: string): Promise<GeoLocation>;
  reverseGeocode(location: GeoLocation): Promise<string>;
}

export interface MapOptions {
  center: GeoLocation;
  zoom: number;
  style?: string;
}

export interface MarkerOptions {
  position: GeoLocation;
  title?: string;
  icon?: string;
}

export interface Marker {
  position: GeoLocation;
  setVisible(visible: boolean): void;
  setPosition(position: GeoLocation): void;
}

export interface Route {
  distance: number;
  duration: number;
  polyline: string;
}

// --- Search Service Abstraction (update.md 36) ---

export interface SearchService {
  search(collection: string, query: string, options?: SearchOptions): Promise<SearchResult[]>;
  filterByField(collection: string, field: string, value: unknown): Promise<SearchResult[]>;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface SearchResult {
  id: string;
  data: Record<string, unknown>;
  score?: number;
}
