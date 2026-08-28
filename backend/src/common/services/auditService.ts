import { Injectable } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";
import { UserRole } from "@/common/types";

/**
 * Audit Logging Service
 *
 * - Immutable / Append-only
 * - No client direct write
 * - Records all sensitive actions
 * - Stores before/after state for mutations
 */
@Injectable()
export class AuditService {
  private get auditLogs() {
    return firestore.collection("audit_logs");
  }

  /**
   * Log an audit event (append-only, never update or delete)
   */
  async log(params: {
    actorId: string;
    actorRole: UserRole;
    action: string;
    entityType: string;
    entityId: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    reason?: string;
    ipHash?: string;
    metadata?: Record<string, unknown>;
  }) {
    const logRef = this.auditLogs.doc();

    const auditEntry = {
      id: logRef.id,
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      before: params.before || null,
      after: params.after || null,
      reason: params.reason || null,
      ipHash: params.ipHash || null,
      timestamp: FieldValue.serverTimestamp(),
      metadata: params.metadata || null,
    };

    await logRef.set(auditEntry);
    return logRef.id;
  }

  /**
   * Get audit logs for an entity
   */
  async getEntityLogs(entityType: string, entityId: string, limit = 50) {
    const snapshot = await this.auditLogs
      .where("entityType", "==", entityType)
      .where("entityId", "==", entityId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get audit logs for an actor
   */
  async getActorLogs(actorId: string, limit = 50) {
    const snapshot = await this.auditLogs
      .where("actorId", "==", actorId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get all audit logs (admin only)
   */
  async getAllLogs(limit = 100, offset = 0) {
    const snapshot = await this.auditLogs
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get logs by action type
   */
  async getLogsByAction(action: string, limit = 50) {
    const snapshot = await this.auditLogs
      .where("action", "==", action)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // Common audit action constants
  static readonly ACTIONS = {
    // Pickup
    PICKUP_CREATED: "PICKUP_CREATED",
    PICKUP_CANCELLED: "PICKUP_CANCELLED",
    PICKUP_COMPLETED: "PICKUP_COMPLETED",

    // Matching
    COLLECTOR_ASSIGNED: "COLLECTOR_ASSIGNED",
    COLLECTOR_ACCEPTED_PICKUP: "COLLECTOR_ACCEPTED_PICKUP",
    COLLECTOR_REJECTED_PICKUP: "COLLECTOR_REJECTED_PICKUP",

    // Verification
    CUSTOMER_CONFIRMED_WEIGHT: "CUSTOMER_CONFIRMED_WEIGHT",
    COLLECTOR_SUBMITTED_VERIFICATION: "COLLECTOR_SUBMITTED_VERIFICATION",

    // Wallet
    WALLET_BALANCE_CREDITED: "WALLET_BALANCE_CREDITED",
    WALLET_WITHDRAWAL_REQUESTED: "WALLET_WITHDRAWAL_REQUESTED",
    WALLET_ECO_POINTS_AWARDED: "WALLET_ECO_POINTS_AWARDED",

    // Dispute
    DISPUTE_CREATED: "DISPUTE_CREATED",
    DISPUTE_RESOLVED: "DISPUTE_RESOLVED",

    // Admin
    ADMIN_CHANGED_PRICE: "ADMIN_CHANGED_PRICE",
    ADMIN_REVIEWED_FRAUD: "ADMIN_REVIEWED_FRAUD",
    ADMIN_CHANGED_CONFIG: "ADMIN_CHANGED_CONFIG",

    // Marketplace
    ORDER_CREATED: "ORDER_CREATED",
    ORDER_PAID: "ORDER_PAID",
    ORDER_SHIPPED: "ORDER_SHIPPED",
    ORDER_COMPLETED: "ORDER_COMPLETED",
  } as const;
}
