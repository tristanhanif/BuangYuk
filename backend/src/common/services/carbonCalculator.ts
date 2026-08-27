import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { wasteSchema } from "@/common/validators/wasteSchema";

@Injectable()
export class CarbonCalculator {
  calculate(input: z.infer<typeof wasteSchema>) {
    const parsed = wasteSchema.parse(input);

    const { quantity, unit, subCategoryId } = parsed;

    // Mock category data
    const category = this.getCategory(subCategoryId);

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

  private getCategory(subCategoryId: string) {
    const mockCategories: Record<string, any> = {
      paper_cardboard: {
        conversionFactorToKg: 1.0,
        emissionSavingFactor: 1.5,
        basePricePerKg: 500,
      },
      plastic: {
        conversionFactorToKg: 1.0,
        emissionSavingFactor: 2.0,
        basePricePerKg: 300,
      },
      glass: {
        conversionFactorToKg: 1.0,
        emissionSavingFactor: 1.8,
        basePricePerKg: 200,
      },
    };

    return mockCategories[subCategoryId] || {
      conversionFactorToKg: 1.0,
      emissionSavingFactor: 1.0,
      basePricePerKg: 100,
    };
  }
}