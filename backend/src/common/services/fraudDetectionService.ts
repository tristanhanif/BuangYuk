import { Injectable } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";
import { FraudFlagStatus } from "@/common/types";

/**
 * Rule-Based Fraud Detection Service
 *
 * NOT AI/ML — purely rule-based flagging.
 * System only provides flags. Admin has final decision.
 * All reviews are recorded in audit trail.
 *
 * Example Rules:
 * - Excessive cancellation
 * - Abnormal weight deviation
 * - Repeated dispute
 * - Suspicious transaction frequency
 * - Impossible GPS movement
 * - Duplicate proof
 * - Repeated failed payment
 * - Unusual activity pattern
 */
@Injectable()
export class FraudDetectionService {
  private get flags() {
    return firestore.collection("fraud_flags");
  }

  /**
   * Create a fraud flag
   */
  async createFlag(params: {
    entityType: "user" | "pickup" | "order" | "transaction";
    entityId: string;
    rule: string;
    description: string;
    severity: "low" | "medium" | "high";
    metadata?: Record<string, unknown>;
  }) {
    const flagRef = this.flags.doc();

    const flagData = {
      id: flagRef.id,
      entityType: params.entityType,
      entityId: params.entityId,
      rule: params.rule,
      description: params.description,
      severity: params.severity,
      status: "FLAGGED" as FraudFlagStatus,
      reviewedBy: null,
      reviewNotes: null,
      reviewedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      metadata: params.metadata || null,
    };

    await flagRef.set(flagData);
    return flagRef.id;
  }

  /**
   * Check for excessive cancellation fraud
   */
  async checkExcessiveCancellation(userId: string, windowDays = 7, threshold = 5) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - windowDays);

    const snapshot = await firestore
      .collection("pickup_events")
      .where("actorId", "==", userId)
      .where("toStatus", "==", "CANCELLED")
      .orderBy("timestamp", "desc")
      .limit(threshold + 10)
      .get();

    const cancellations = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate?.() || new Date(0);
      return timestamp >= startDate;
    });

    if (cancellations.length >= threshold) {
      return this.createFlag({
        entityType: "user",
        entityId: userId,
        rule: "EXCESSIVE_CANCELLATION",
        description: `User ${userId} cancelled ${cancellations.length} pickups in ${windowDays} days (threshold: ${threshold})`,
        severity: cancellations.length >= threshold * 2 ? "high" : "medium",
        metadata: { cancellations: cancellations.length, windowDays, threshold },
      });
    }

    return null;
  }

  /**
   * Check for abnormal weight deviation
   */
  async checkWeightDeviation(
    pickupId: string,
    estimatedWeight: number,
    verifiedWeight: number,
    threshold = 0.5,
  ) {
    if (estimatedWeight === 0) return null;

    const deviation = Math.abs(verifiedWeight - estimatedWeight) / estimatedWeight;

    if (deviation > threshold) {
      return this.createFlag({
        entityType: "pickup",
        entityId: pickupId,
        rule: "ABNORMAL_WEIGHT_DEVIATION",
        description: `Weight deviation of ${(deviation * 100).toFixed(1)}% on pickup ${pickupId} (estimated: ${estimatedWeight}kg, verified: ${verifiedWeight}kg)`,
        severity: deviation > 1 ? "high" : "medium",
        metadata: { estimatedWeight, verifiedWeight, deviation: deviation * 100 },
      });
    }

    return null;
  }

  /**
   * Check for repeated disputes
   */
  async checkRepeatedDispute(userId: string, windowDays = 30, threshold = 3) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - windowDays);

    const snapshot = await firestore
      .collection("disputes")
      .where("customerId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(threshold + 10)
      .get();

    const disputes = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date(0);
      return createdAt >= startDate;
    });

    if (disputes.length >= threshold) {
      return this.createFlag({
        entityType: "user",
        entityId: userId,
        rule: "REPEATED_DISPUTE",
        description: `User ${userId} filed ${disputes.length} disputes in ${windowDays} days`,
        severity: disputes.length >= threshold * 2 ? "high" : "medium",
        metadata: { disputes: disputes.length, windowDays, threshold },
      });
    }

    return null;
  }

  /**
   * Check for duplicate proof photos
   */
  async checkDuplicateProof(photoUrls: string[]) {
    if (photoUrls.length < 2) return null;

    // Simple check: if same URL appears multiple times
    const unique = new Set(photoUrls);
    if (unique.size < photoUrls.length) {
      return this.createFlag({
        entityType: "pickup",
        entityId: "",
        rule: "DUPLICATE_PROOF",
        description: `Duplicate proof photos detected (${photoUrls.length} photos, ${unique.size} unique)`,
        severity: "low",
        metadata: { totalPhotos: photoUrls.length, uniquePhotos: unique.size },
      });
    }

    return null;
  }

  /**
   * Get all flagged items
   */
  async getFlaggedItems(limit = 50) {
    const snapshot = await this.flags
      .where("status", "in", ["FLAGGED", "UNDER_REVIEW"])
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Admin reviews a fraud flag
   */
  async reviewFlag(
    flagId: string,
    adminId: string,
    status: "RESOLVED" | "UNDER_REVIEW",
    reviewNotes?: string,
  ) {
    await this.flags.doc(flagId).update({
      status,
      reviewedBy: adminId,
      reviewNotes: reviewNotes || null,
      reviewedAt: FieldValue.serverTimestamp(),
    });

    return { id: flagId, status };
  }

  /**
   * Get fraud flags for a specific entity
   */
  async getEntityFlags(entityType: string, entityId: string) {
    const snapshot = await this.flags
      .where("entityType", "==", entityType)
      .where("entityId", "==", entityId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
