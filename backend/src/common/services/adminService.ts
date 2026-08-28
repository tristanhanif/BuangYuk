import { Injectable } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";
import { CommissionConfig } from "@/common/types";

/**
 * Admin Service
 *
 * Provides:
 * - Operations dashboard data
 * - Financial metrics
 * - Risk monitoring
 * - Configuration management
 * - System analytics
 */
@Injectable()
export class AdminService {
  /**
   * Get dashboard analytics — optimized to avoid loading all docs into memory
   */
  async getAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Use limited queries and aggregation instead of loading all docs
    const [completedSnapshot, cancelledSnapshot, usersSnapshot, collectorsSnapshot] =
      await Promise.all([
        firestore
          .collection("pickups")
          .where("status", "==", "COMPLETED")
          .where("createdAt", ">=", thirtyDaysAgo)
          .limit(500)
          .get(),
        firestore
          .collection("pickups")
          .where("status", "==", "CANCELLED")
          .where("createdAt", ">=", thirtyDaysAgo)
          .limit(500)
          .get(),
        firestore.collection("users").limit(1).get(),
        firestore.collection("collectors").where("isActive", "==", true).limit(1).get(),
      ]);

    const completedPickups = completedSnapshot.docs.map((d) => d.data());
    const totalPickups = completedSnapshot.size + cancelledSnapshot.size;

    // Financial stats from completed pickups
    const totalGMV = completedPickups.reduce((sum, p) => sum + (p.bankPurchaseValue || 0), 0);
    const totalCustomerValue = completedPickups.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);
    const totalPlatformMargin = completedPickups.reduce((sum, p) => sum + (p.platformMargin || 0), 0);
    const totalCollectorFees = completedPickups.reduce((sum, p) => sum + (p.collectorFee || 0), 0);

    // Carbon stats
    const totalCO2 = completedPickups.reduce((sum, p) => sum + (p.verifiedWeight || 0) * 2.0, 0);

    // Marketplace stats (limited)
    const ordersSnapshot = await firestore
      .collection("marketplace_orders")
      .where("createdAt", ">=", thirtyDaysAgo)
      .limit(500)
      .get();

    const orders = ordersSnapshot.docs.map((d) => d.data());
    const totalOrderValue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const marketplaceCommission = orders.reduce((sum, o) => sum + (o.commission || 0), 0);

    // User counts (use .size from limited queries as estimates)
    const totalUsers = usersSnapshot.size > 0 ? usersSnapshot.size : 0;
    const activeCollectors = collectorsSnapshot.size;

    return {
      period: "last_30_days",
      pickups: {
        total: totalPickups,
        completed: completedPickups.length,
        cancelled: cancelledSnapshot.size,
        cancellationRate: totalPickups > 0 ? cancelledSnapshot.size / totalPickups : 0,
        averageMatchingTime: 0,
      },
      financial: {
        gmv: totalGMV,
        wasteTransactionValue: totalCustomerValue,
        grossSpread: totalPlatformMargin,
        collectorEarnings: totalCollectorFees,
        marketplaceCommission,
        contributionMargin: totalPlatformMargin + marketplaceCommission,
      },
      carbon: {
        totalCO2Saved: totalCO2,
        estimatedTreesEquivalent: Math.round(totalCO2 / 21),
      },
      users: {
        total: totalUsers,
        activeCollectors,
      },
    };
  }

  /**
   * Get active pickups (operations)
   */
  async getActivePickups() {
    const snapshot = await firestore
      .collection("pickups")
      .where("status", "in", [
        "REQUESTED",
        "MATCHING",
        "ASSIGNED",
        "ACCEPTED",
        "EN_ROUTE",
        "ARRIVED",
        "VERIFYING",
      ])
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get failed pickups
   */
  async getFailedPickups() {
    const snapshot = await firestore
      .collection("pickups")
      .where("status", "in", ["CANCELLED", "EXPIRED", "FAILED"])
      .orderBy("cancelledAt", "desc")
      .limit(50)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get/update system configuration
   */
  async getConfig(configId: string) {
    const doc = await firestore.collection("configs").doc(configId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async updateConfig(
    configId: string,
    updates: Record<string, unknown>,
    adminId: string,
  ) {
    const beforeDoc = await firestore.collection("configs").doc(configId).get();
    const before = beforeDoc.data();

    await firestore.collection("configs").doc(configId).set(
      { ...updates, updatedBy: adminId, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

    return { before, after: updates };
  }

  /**
   * Get commission configuration
   */
  async getCommissionConfig(): Promise<CommissionConfig> {
    const doc = await firestore.collection("configs").doc("commission").get();
    if (doc.exists) {
      return doc.data() as CommissionConfig;
    }

    // Default config
    return {
      marketplaceCommissionRate: 0.10,
      platformGrossSpread: 0.15,
      collectorBaseFee: 5000,
      collectorCommissionRate: 0.05,
      cashoutMinimum: 10000,
      cashoutFee: 1000,
      paymentFeeRate: 0.029,
    };
  }
}
