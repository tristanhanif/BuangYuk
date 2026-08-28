import { Injectable } from "@nestjs/common";
import { firestore } from "@/common/firebaseAdmin";
import { WasteGrade, WasteCondition, PricingSnapshot } from "@/common/types";

interface PricingConfigData {
  id: string;
  regionId: string;
  materialId: string;
  grade: WasteGrade;
  condition: WasteCondition;
  basePrice: number;
  gradeFactor: number;
  conditionFactor: number;
  regionFactor: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

/**
 * Dynamic Waste Pricing Engine
 *
 * Formula:
 * Waste Price = Base Price × Grade Factor × Condition Factor × Region Factor
 *
 * All factors configurable by Admin per region/Bank Sampah/material/grade/condition.
 */
@Injectable()
export class PricingService {
  /**
   * Calculate the price for a waste item
   */
  async calculatePrice(
    materialId: string,
    grade: WasteGrade,
    condition: WasteCondition,
    regionId: string,
    weightKg: number,
  ): Promise<{
    unitPrice: number;
    totalPrice: number;
    snapshot: PricingSnapshot;
  }> {
    const config = await this.getPricingConfig(materialId, grade, condition, regionId);

    const unitPrice = Math.round(
      config.basePrice * config.gradeFactor * config.conditionFactor * config.regionFactor,
    );

    const totalPrice = Math.round(unitPrice * weightKg);

    const snapshot: PricingSnapshot = {
      materialId,
      grade,
      condition,
      regionId,
      basePrice: config.basePrice,
      gradeFactor: config.gradeFactor,
      conditionFactor: config.conditionFactor,
      regionFactor: config.regionFactor,
      finalPrice: unitPrice,
      capturedAt: new Date(),
    };

    return { unitPrice, totalPrice, snapshot };
  }

  /**
   * Calculate full transaction pricing (customer value, platform margin, bank purchase value)
   */
  async calculateTransactionPricing(
    materialId: string,
    grade: WasteGrade,
    condition: WasteCondition,
    regionId: string,
    weightKg: number,
    collectorFee: number,
    platformMarginPercent: number = 0.15,
  ): Promise<{
    customerWasteValue: number;
    collectorFee: number;
    platformMargin: number;
    bankPurchaseValue: number;
    snapshot: PricingSnapshot;
  }> {
    const { unitPrice, totalPrice: customerWasteValue, snapshot } =
      await this.calculatePrice(materialId, grade, condition, regionId, weightKg);

    // Platform gross spread = Bank Purchase Value - Customer Waste Value
    // Bank Purchase Value = Customer Waste Value + Platform Margin + Collector Fee
    const platformMargin = Math.round(customerWasteValue * platformMarginPercent);
    const bankPurchaseValue = customerWasteValue + platformMargin + collectorFee;

    return {
      customerWasteValue,
      collectorFee,
      platformMargin,
      bankPurchaseValue,
      snapshot,
    };
  }

  /**
   * Get pricing config from Firestore, falling back to defaults
   */
  private async getPricingConfig(
    materialId: string,
    grade: WasteGrade,
    condition: WasteCondition,
    regionId: string,
  ): Promise<PricingConfigData> {
    try {
      const snapshot = await firestore
        .collection("pricing_configs")
        .where("materialId", "==", materialId)
        .where("grade", "==", grade)
        .where("condition", "==", condition)
        .where("regionId", "==", regionId)
        .where("effectiveTo", "==", null)
        .limit(1)
        .get();

      if (snapshot.docs.length > 0) {
        return snapshot.docs[0].data() as PricingConfigData;
      }
    } catch {
      // Fallback to defaults
    }

    return this.getDefaultPricing(materialId, grade, condition, regionId);
  }

  /**
   * Default pricing fallback
   */
  private getDefaultPricing(
    materialId: string,
    grade: WasteGrade,
    condition: WasteCondition,
    regionId: string = "bandung",
  ): PricingConfigData {
    const basePrices: Record<string, number> = {
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

    const gradeFactors: Record<WasteGrade, number> = {
      A: 1.0,
      B: 0.8,
      C: 0.6,
      D: 0.4,
    };

    const conditionFactors: Record<WasteCondition, number> = {
      clean: 1.0,
      mixed: 0.85,
      dirty: 0.7,
      contaminated: 0.5,
    };

    return {
      id: "default",
      regionId: regionId,
      materialId,
      grade,
      condition,
      basePrice: basePrices[materialId] || 1000,
      gradeFactor: gradeFactors[grade] || 1.0,
      conditionFactor: conditionFactors[condition] || 1.0,
      regionFactor: 1.0,
      effectiveFrom: new Date(),
    };
  }

  /**
   * Admin: Create or update pricing config
   */
  async upsertPricingConfig(config: Omit<PricingConfigData, "id">): Promise<string> {
    const snapshot = await firestore
      .collection("pricing_configs")
      .where("materialId", "==", config.materialId)
      .where("grade", "==", config.grade)
      .where("condition", "==", config.condition)
      .where("regionId", "==", config.regionId)
      .where("effectiveTo", "==", null)
      .limit(1)
      .get();

    if (snapshot.docs.length > 0) {
      // Close the old config
      await snapshot.docs[0].ref.update({ effectiveTo: new Date() });
    }

    const newRef = firestore.collection("pricing_configs").doc();
    await newRef.set({ ...config, id: newRef.id });
    return newRef.id;
  }
}
