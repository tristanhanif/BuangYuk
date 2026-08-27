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
