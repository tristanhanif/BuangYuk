import { Injectable, BadRequestException } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";
import { DisputeCategory, DisputeStatus, DisputeResolution } from "@/common/types";

/**
 * Dispute & Arbitration Service
 *
 * Lifecycle: OPEN → UNDER_REVIEW → RESOLVED
 * SLA: 24 hours
 * Resolution: Customer favored / Collector favored / Bank Sampah favored / Partial adjustment
 * Admin has final arbitration authority
 */
@Injectable()
export class DisputeService {
  private get disputes() {
    return firestore.collection("disputes");
  }

  /**
   * Create a new dispute
   */
  async createDispute(params: {
    pickupId: string;
    customerId: string;
    customerName: string;
    collectorId?: string;
    collectorName?: string;
    bankId?: string;
    category: DisputeCategory;
    description: string;
    evidencePhotoUrls?: string[];
  }) {
    const disputeRef = this.disputes.doc();

    const disputeData = {
      id: disputeRef.id,
      pickupId: params.pickupId,
      customerId: params.customerId,
      customerName: params.customerName,
      collectorId: params.collectorId || null,
      collectorName: params.collectorName || null,
      bankId: params.bankId || null,
      category: params.category,
      description: params.description,
      evidencePhotoUrls: params.evidencePhotoUrls || [],
      status: "OPEN" as DisputeStatus,
      resolution: null,
      resolutionNotes: null,
      resolvedBy: null,
      resolvedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await disputeRef.set(disputeData);

    // Update pickup status to DISPUTED via state machine
    const pickupDoc = await firestore.collection("pickups").doc(params.pickupId).get();
    if (pickupDoc.exists) {
      const pickup = pickupDoc.data()!;
      const currentStatus = pickup.status;
      const allowedTransitions: Record<string, string[]> = {
        VERIFYING: ["DISPUTED"],
        COMPLETED: ["DISPUTED"],
      };
      if (allowedTransitions[currentStatus]?.includes("DISPUTED")) {
        await firestore.collection("pickups").doc(params.pickupId).update({
          status: "DISPUTED",
        });
      }
    }

    return { id: disputeRef.id, status: "OPEN" };
  }

  /**
   * Admin reviews a dispute
   */
  async reviewDispute(disputeId: string, adminId: string) {
    const disputeDoc = await this.disputes.doc(disputeId).get();
    if (!disputeDoc.exists) {
      throw new BadRequestException("Dispute not found");
    }

    const dispute = disputeDoc.data()!;
    if (dispute.status !== "OPEN") {
      throw new BadRequestException("Dispute is not in OPEN status");
    }

    await this.disputes.doc(disputeId).update({
      status: "UNDER_REVIEW",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Admin resolves a dispute with final decision
   */
  async resolveDispute(
    disputeId: string,
    adminId: string,
    resolution: DisputeResolution,
    resolutionNotes: string,
    adjustmentAmount?: number,
  ) {
    const disputeDoc = await this.disputes.doc(disputeId).get();
    if (!disputeDoc.exists) {
      throw new BadRequestException("Dispute not found");
    }

    const dispute = disputeDoc.data()!;
    if (dispute.status === "RESOLVED") {
      throw new BadRequestException("Dispute is already resolved");
    }

    await this.disputes.doc(disputeId).update({
      status: "RESOLVED",
      resolution,
      resolutionNotes,
      resolvedBy: adminId,
      resolvedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Apply resolution based on type
    const wallets = firestore.collection("wallets");
    const pickupDoc = await firestore.collection("pickups").doc(dispute.pickupId).get();
    const pickup = pickupDoc.exists ? pickupDoc.data()! : null;
    const finalValue = pickup?.finalValue || pickup?.estimatedValue || 0;

    switch (resolution) {
      case "customer_favored": {
        // Refund customer: credit wallet with disputed amount
        if (finalValue > 0 && dispute.customerId) {
          const walletRef = wallets.doc(dispute.customerId);
          await firestore.runTransaction(async (t) => {
            const walletDoc = await t.get(walletRef);
            const currentBalance = walletDoc.exists ? walletDoc.data()!.balance : 0;
            t.set(walletRef, {
              balance: currentBalance + finalValue,
              updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
          });

          // Log wallet credit
          await firestore.collection("wallet_transactions").doc().set({
            walletId: dispute.customerId,
            userId: dispute.customerId,
            type: "dispute_refund",
            amount: finalValue,
            description: `Refund dari dispute #${disputeId.slice(0, 8)}`,
            disputeId,
            status: "completed",
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }
      case "collector_favored": {
        // Collector keeps current state — no financial change
        break;
      }
      case "bank_favored": {
        // Bank Sampah's assessment stands — no financial change
        break;
      }
      case "partial_adjustment": {
        if (adjustmentAmount && adjustmentAmount > 0 && dispute.customerId) {
          const walletRef = wallets.doc(dispute.customerId);
          await firestore.runTransaction(async (t) => {
            const walletDoc = await t.get(walletRef);
            const currentBalance = walletDoc.exists ? walletDoc.data()!.balance : 0;
            t.set(walletRef, {
              balance: currentBalance + adjustmentAmount,
              updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
          });

          await firestore.collection("wallet_transactions").doc().set({
            walletId: dispute.customerId,
            userId: dispute.customerId,
            type: "dispute_adjustment",
            amount: adjustmentAmount,
            description: `Penyesuaian dari dispute #${disputeId.slice(0, 8)}`,
            disputeId,
            status: "completed",
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }
    }

    return { id: disputeId, status: "RESOLVED", resolution };
  }

  /**
   * Get a single dispute
   */
  async getDispute(disputeId: string) {
    const doc = await this.disputes.doc(disputeId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  /**
   * Get disputes for a customer
   */
  async getCustomerDisputes(customerId: string, limit = 20) {
    const snapshot = await this.disputes
      .where("customerId", "==", customerId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get all open disputes (admin)
   */
  async getOpenDisputes(limit = 50) {
    const snapshot = await this.disputes
      .where("status", "in", ["OPEN", "UNDER_REVIEW"])
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Check SLA compliance (24-hour SLA)
   */
  async checkSLACompliance(): Promise<string[]> {
    const now = Date.now();
    const slaHours = 24;

    const snapshot = await this.disputes
      .where("status", "in", ["OPEN", "UNDER_REVIEW"])
      .get();

    const overdue: string[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date(0);
      const hoursElapsed = (now - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed > slaHours) {
        overdue.push(doc.id);
      }
    }

    return overdue;
  }
}
