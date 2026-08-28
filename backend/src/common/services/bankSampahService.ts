import { Injectable, BadRequestException } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";

/**
 * Bank Sampah Service
 *
 * Manages:
 * - Daily capacity
 * - Material acceptance
 * - Settlement records
 * - Supply management
 * - Fallback partner when capacity is full
 */
@Injectable()
export class BankSampahService {
  private get banks() {
    return firestore.collection("banks");
  }

  private get settlements() {
    return firestore.collection("settlements");
  }

  /**
   * Get bank capacity for today
   */
  async getTodayCapacity(bankId: string) {
    const today = new Date().toISOString().split("T")[0];

    const doc = await firestore
      .collection("bank_capacity")
      .doc(`${bankId}_${today}`)
      .get();

    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }

    // Get bank default capacity
    const bankDoc = await this.banks.doc(bankId).get();
    if (!bankDoc.exists) {
      throw new BadRequestException("Bank Sampah not found");
    }

    const bank = bankDoc.data()!;
    const capacityData = {
      id: `${bankId}_${today}`,
      bankId,
      date: today,
      dailyCapacityKg: bank.dailyCapacityKg || 1000,
      currentLoadKg: 0,
      isFull: false,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await firestore.collection("bank_capacity").doc(`${bankId}_${today}`).set(capacityData);
    return capacityData;
  }

  /**
   * Check if bank has capacity for incoming weight
   */
  async hasCapacity(bankId: string, weightKg: number): Promise<boolean> {
    const capacity = await this.getTodayCapacity(bankId) as any;
    return (capacity.currentLoadKg || 0) + weightKg <= (capacity.dailyCapacityKg || 0);
  }

  /**
   * Add weight to bank capacity
   */
  async addSupply(bankId: string, weightKg: number, pickupId: string) {
    const today = new Date().toISOString().split("T")[0];
    const capacityRef = firestore.collection("bank_capacity").doc(`${bankId}_${today}`);

    await firestore.runTransaction(async (t) => {
      const doc = await t.get(capacityRef);
      const current = doc.data()?.currentLoadKg || 0;
      const capacity = doc.data()?.dailyCapacityKg || 1000;

      if (current + weightKg > capacity) {
        throw new BadRequestException("Bank capacity exceeded");
      }

      t.update(capacityRef, {
        currentLoadKg: current + weightKg,
        isFull: current + weightKg >= capacity * 0.95,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  }

  /**
   * Find fallback partner when capacity is full — batch capacity check
   */
  async findFallbackPartner(regionId: string, excludeBankId: string, weightKg: number) {
    const snapshot = await this.banks
      .where("isActive", "==", true)
      .where("regionId", "==", regionId)
      .get();

    if (snapshot.empty) return null;

    // Batch load all capacity docs for today
    const today = new Date().toISOString().split("T")[0];
    const bankIds = snapshot.docs.filter(d => d.id !== excludeBankId).map(d => d.id);

    if (bankIds.length === 0) return null;

    // Load all capacity docs in parallel
    const capacityDocs = await Promise.all(
      bankIds.map(id => firestore.collection("bank_capacity").doc(`${id}_${today}`).get())
    );

    // Find first bank with capacity
    for (let i = 0; i < bankIds.length; i++) {
      const capDoc = capacityDocs[i];
      const currentLoad = capDoc.exists ? (capDoc.data()?.currentLoadKg || 0) : 0;
      const dailyCapacity = capDoc.exists ? (capDoc.data()?.dailyCapacityKg || 1000) : 1000;

      if (currentLoad + weightKg <= dailyCapacity) {
        const bankDoc = snapshot.docs.find(d => d.id === bankIds[i]);
        return bankDoc ? { id: bankDoc.id, ...bankDoc.data() } : null;
      }
    }

    return null;
  }

  /**
   * Create settlement record
   */
  async createSettlement(params: {
    bankId: string;
    pickupId: string;
    customerId: string;
    materialWeight: number;
    purchaseValue: number;
    platformMargin: number;
  }) {
    const settlementRef = this.settlements.doc();

    await settlementRef.set({
      id: settlementRef.id,
      bankId: params.bankId,
      pickupId: params.pickupId,
      customerId: params.customerId,
      materialWeight: params.materialWeight,
      purchaseValue: params.purchaseValue,
      platformMargin: params.platformMargin,
      status: "pending",
      confirmedAt: null,
      settledAt: null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return settlementRef.id;
  }

  /**
   * Confirm settlement (Bank Sampah confirms receipt)
   */
  async confirmSettlement(settlementId: string, bankId: string) {
    await this.settlements.doc(settlementId).update({
      status: "confirmed",
      confirmedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Settle payment (final settlement)
   */
  async settlePayment(settlementId: string) {
    await this.settlements.doc(settlementId).update({
      status: "settled",
      settledAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Get bank dashboard data
   */
  async getBankDashboard(bankId: string) {
    const capacity = await this.getTodayCapacity(bankId);

    const settlementsSnapshot = await this.settlements
      .where("bankId", "==", bankId)
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    const settlements = settlementsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    const pendingSettlements = settlements.filter((s: any) => s.status === "pending");

    return {
      capacity,
      settlements: {
        total: settlements.length,
        pending: pendingSettlements.length,
        totalValue: settlements.reduce((sum: number, s: any) => sum + (s.purchaseValue || 0), 0),
      },
    };
  }
}
