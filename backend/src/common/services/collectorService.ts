import { Injectable, BadRequestException } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";

/**
 * Collector Service
 *
 * Manages:
 * - Earnings (base fee + commission, 24h hold)
 * - Reliability score
 * - Pickup assignment
 * - Location tracking
 */
@Injectable()
export class CollectorService {
  private get collectors() {
    return firestore.collection("collectors");
  }

  private get earnings() {
    return firestore.collection("collector_earnings");
  }

  /**
   * Calculate and record earnings after pickup completion
   *
   * Earnings = Base Fee + Commission
   * Net Available = Gross Earnings - Applicable Adjustments
   * Status: PENDING → 24h hold → AVAILABLE → WITHDRAWAL
   */
  async recordEarnings(
    collectorId: string,
    pickupId: string,
    baseFee: number,
    commissionRate: number,
    pickupValue: number,
    holdHours: number = 24,
  ) {
    const commission = Math.round(pickupValue * commissionRate);
    const grossEarnings = baseFee + commission;

    const holdUntil = new Date();
    holdUntil.setHours(holdUntil.getHours() + holdHours);

    const earningRef = this.earnings.doc();
    await earningRef.set({
      id: earningRef.id,
      collectorId,
      pickupId,
      baseFee,
      commission,
      grossEarnings,
      adjustments: 0,
      netAvailable: grossEarnings,
      status: "PENDING",
      holdUntil: holdUntil,
      createdAt: FieldValue.serverTimestamp(),
      availableAt: null,
      withdrawnAt: null,
    });

    return {
      earningId: earningRef.id,
      baseFee,
      commission,
      grossEarnings,
      holdUntil,
    };
  }

  /**
   * Release earnings after hold period
   * Called by a scheduled job
   */
  async releaseEarnings() {
    const now = new Date();

    const snapshot = await this.earnings
      .where("status", "==", "PENDING")
      .where("holdUntil", "<=", now)
      .get();

    const batch = firestore.batch();
    for (const doc of snapshot.docs) {
      batch.update(doc.ref, {
        status: "AVAILABLE",
        availableAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    return snapshot.docs.length;
  }

  /**
   * Withdraw earnings
   */
  async withdrawEarnings(collectorId: string, earningIds: string[]) {
    const batch = firestore.batch();
    let totalWithdrawal = 0;

    for (const earningId of earningIds) {
      const doc = await this.earnings.doc(earningId).get();
      if (!doc.exists) continue;

      const data = doc.data()!;
      if (data.status !== "AVAILABLE") {
        throw new BadRequestException(`Earning ${earningId} is not available for withdrawal`);
      }
      if (data.collectorId !== collectorId) {
        throw new BadRequestException("Unauthorized");
      }

      batch.update(doc.ref, {
        status: "WITHDRAWN",
        withdrawnAt: FieldValue.serverTimestamp(),
      });

      totalWithdrawal += data.netAvailable;
    }

    await batch.commit();
    return { totalWithdrawal, count: earningIds.length };
  }

  /**
   * Get collector earnings
   */
  async getEarnings(collectorId: string, status?: string, limit = 20) {
    let query = firestore
      .collection("collector_earnings")
      .where("collectorId", "==", collectorId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Update collector reliability score
   *
   * Score based on:
   * - Completion rate
   * - Acceptance rate
   * - Weight accuracy
   * - Customer ratings
   */
  async updateReliabilityScore(collectorId: string) {
    const collectorDoc = await this.collectors.doc(collectorId).get();
    if (!collectorDoc.exists) return;

    const collector = collectorDoc.data()!;
    const totalPickups = collector.totalPickups || 0;
    const completedPickups = collector.completedPickups || 0;
    const acceptanceRate = collector.acceptanceRate || 0;

    // Simple scoring formula
    let score = 50; // Base score
    if (totalPickups > 0) {
      score += (completedPickups / totalPickups) * 25;
      score += acceptanceRate * 25;
    }
    score = Math.min(100, Math.max(0, score));

    await this.collectors.doc(collectorId).update({
      reliabilityScore: Math.round(score),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return score;
  }

  /**
   * Update collector location
   */
  async updateLocation(collectorId: string, lat: number, lng: number, accuracy: number) {
    await this.collectors.doc(collectorId).update({
      currentLat: lat,
      currentLng: lng,
      lastLocationUpdate: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Get collector profile
   */
  async getCollector(userId: string) {
    const doc = await this.collectors.doc(userId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  /**
   * Update collector current load — atomic via runTransaction
   */
  async updateLoad(collectorId: string, additionalKg: number) {
    const collectorRef = this.collectors.doc(collectorId);

    await firestore.runTransaction(async (t) => {
      const doc = await t.get(collectorRef);
      if (!doc.exists) throw new BadRequestException("Collector not found");

      const data = doc.data()!;
      const newLoad = (data.currentLoadKg || 0) + additionalKg;

      if (newLoad > (data.maxCapacityKg || 0)) {
        throw new BadRequestException("Exceeds maximum capacity");
      }

      t.update(collectorRef, {
        currentLoadKg: newLoad,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  }
}
