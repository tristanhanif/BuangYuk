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