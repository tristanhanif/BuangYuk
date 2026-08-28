import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { firestore } from "@/common/firebaseAdmin";
import { wasteSchema } from "@/common/validators/wasteSchema";

const FALLBACK_CATEGORIES: Record<string, any> = {
  paper_cardboard: { conversionFactorToKg: 1.0, emissionSavingFactor: 1.5, basePricePerKg: 500 },
  plastic: { conversionFactorToKg: 1.0, emissionSavingFactor: 2.0, basePricePerKg: 300 },
  glass: { conversionFactorToKg: 1.0, emissionSavingFactor: 1.8, basePricePerKg: 200 },
  aluminium: { conversionFactorToKg: 1.0, emissionSavingFactor: 9.0, basePricePerKg: 15000 },
  iron_steel: { conversionFactorToKg: 1.0, emissionSavingFactor: 1.5, basePricePerKg: 3000 },
  copper: { conversionFactorToKg: 1.0, emissionSavingFactor: 3.0, basePricePerKg: 50000 },
  electronic: { conversionFactorToKg: 1.0, emissionSavingFactor: 5.0, basePricePerKg: 10000 },
  organic: { conversionFactorToKg: 1.0, emissionSavingFactor: 0.5, basePricePerKg: 100 },
  textile: { conversionFactorToKg: 1.0, emissionSavingFactor: 3.5, basePricePerKg: 2000 },
  rubber: { conversionFactorToKg: 1.0, emissionSavingFactor: 3.0, basePricePerKg: 1500 },
  wood: { conversionFactorToKg: 1.0, emissionSavingFactor: 0.8, basePricePerKg: 500 },
  mixed: { conversionFactorToKg: 1.0, emissionSavingFactor: 1.0, basePricePerKg: 200 },
  hazardous: { conversionFactorToKg: 1.0, emissionSavingFactor: 4.0, basePricePerKg: 5000 },
  other: { conversionFactorToKg: 1.0, emissionSavingFactor: 1.0, basePricePerKg: 100 },
};

@Injectable()
export class CarbonCalculator {
  private categoryCache: Map<string, any> = new Map();

  async calculate(input: z.infer<typeof wasteSchema>) {
    const parsed = wasteSchema.parse(input);

    const { quantity, unit, subCategoryId } = parsed;

    const category = await this.getCategory(subCategoryId);

    // Normalization Layer: Convert to kg
    let weightKg: number;
    if (unit === "pcs") {
      weightKg = quantity * (category.conversionFactorToKg || 1.0);
    } else {
      weightKg = quantity;
    }

    // Emission Reduction Layer: Calculate CO2e saved
    const co2eSaved = weightKg * (category.emissionSavingFactor || 0);

    // Financial Reward Layer: Calculate cash reward
    const cashReward = Math.floor(weightKg * (category.basePricePerKg || 0));

    // Gamification Incentive Layer: Calculate eco-points
    const Rw = 10;
    const Rc = 50;
    const ecoPoints = Math.round((weightKg * Rw) + (co2eSaved * Rc));

    return {
      weightKg,
      co2eSaved,
      cashReward,
      ecoPoints,
    };
  }

  private async getCategory(subCategoryId: string) {
    if (this.categoryCache.has(subCategoryId)) {
      return this.categoryCache.get(subCategoryId);
    }

    try {
      const doc = await firestore.collection("waste_categories").doc(subCategoryId).get();
      if (doc.exists) {
        const data = doc.data()!;
        const category = {
          conversionFactorToKg: data.conversionFactorToKg || 1.0,
          emissionSavingFactor: data.emissionSavingFactor || 1.0,
          basePricePerKg: data.basePricePerKg || 100,
        };
        this.categoryCache.set(subCategoryId, category);
        return category;
      }
    } catch {
      // Fallback to mock
    }

    const fallback = FALLBACK_CATEGORIES[subCategoryId] || {
      conversionFactorToKg: 1.0,
      emissionSavingFactor: 1.0,
      basePricePerKg: 100,
    };
    this.categoryCache.set(subCategoryId, fallback);
    return fallback;
  }
}