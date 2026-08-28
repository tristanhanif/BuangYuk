import { z } from "zod";

export const wasteSchema = z.object({
  categoryId: z.string().nonempty("Category ID is required"),
  subCategoryId: z.string().nonempty("Sub-category ID is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.enum(["kg", "pcs"]),
  photoStoragePath: z.string().nonempty("Photo storage path is required"),
  pickupMethod: z.enum(["DROP_OFF", "PICK_UP"]),
});

export type WasteSchema = z.infer<typeof wasteSchema>;

export const verificationSchema = z.object({
  transactionId: z.string().nonempty("Transaction ID is required"),
  verifiedWeightKg: z.number().positive("Verified weight must be positive"),
  adjustedSubCategoryId: z.string().optional(),
  verifierNote: z.string().optional(),
});

export type VerificationSchema = z.infer<typeof verificationSchema>;

export const rewardSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  rewardItemId: z.string().nonempty("Reward item ID is required"),
  pointsSpent: z.number().positive("Points spent must be positive"),
});

export type RewardSchema = z.infer<typeof rewardSchema>;

// --- Pickup Schemas ---

export const createPickupSchema = z.object({
  regionId: z.string().nonempty("Region ID is required"),
  wasteItems: z.array(z.object({
    categoryId: z.string(),
    categoryLabel: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    weightKg: z.number().positive(),
    grade: z.string().optional(),
    condition: z.string().optional(),
    material: z.string().optional(),
  })).min(1, "At least one waste item required"),
  estimatedWeight: z.number().positive(),
  pickupLocation: z.object({ lat: z.number(), lng: z.number() }),
  pickupAddress: z.string().nonempty(),
  proofPhotoUrls: z.array(z.string()).optional(),
  notes: z.string().optional(),
  preferredTime: z.string().optional(),
});

export type CreatePickupSchema = z.infer<typeof createPickupSchema>;

// --- Dispute Schemas ---

export const createDisputeSchema = z.object({
  pickupId: z.string().nonempty(),
  category: z.enum(["weight", "price", "material", "condition", "pickup", "payment", "other"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  evidencePhotoUrls: z.array(z.string()).optional(),
});

export type CreateDisputeSchema = z.infer<typeof createDisputeSchema>;

// --- Marketplace Schemas ---

export const createOrderSchema = z.object({
  productId: z.string().nonempty(),
  quantity: z.number().positive(),
  shippingAddress: z.string().nonempty(),
  commissionRate: z.number().min(0).max(1).optional(),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
