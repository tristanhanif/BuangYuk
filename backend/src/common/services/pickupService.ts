import { Injectable, BadRequestException } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";
import {
  PickupStatus,
  PICKUP_STATE_MACHINE,
  GeoLocation,
} from "@/common/types";

export interface CreatePickupDto {
  customerId: string;
  customerName: string;
  regionId: string;
  wasteItems: Array<{
    categoryId: string;
    categoryLabel: string;
    quantity: number;
    unit: string;
    weightKg: number;
    grade?: string;
    condition?: string;
    material?: string;
  }>;
  estimatedWeight: number;
  estimatedValue: number;
  pickupLocation: GeoLocation;
  pickupAddress: string;
  proofPhotoUrls: string[];
  notes?: string;
  preferredTime?: string;
}

@Injectable()
export class PickupService {
  private get pickups() {
    return firestore.collection("pickups");
  }

  private get events() {
    return firestore.collection("pickup_events");
  }

  /**
   * Create a new pickup request — initial status: REQUESTED
   */
  async createPickup(dto: CreatePickupDto) {
    const pickupRef = this.pickups.doc();
    const now = FieldValue.serverTimestamp();

    const pickupData = {
      id: pickupRef.id,
      customerId: dto.customerId,
      customerName: dto.customerName,
      status: "REQUESTED" as PickupStatus,
      wasteItems: dto.wasteItems,
      estimatedWeight: dto.estimatedWeight,
      estimatedValue: dto.estimatedValue,
      pickupLocation: dto.pickupLocation,
      pickupAddress: dto.pickupAddress,
      proofPhotoUrls: dto.proofPhotoUrls,
      notes: dto.notes || null,
      preferredTime: dto.preferredTime || null,
      regionId: dto.regionId,
      collectorId: null,
      collectorName: null,
      bankId: null,
      bankName: null,
      verifiedWeight: null,
      finalValue: null,
      collectorFee: 0,
      platformMargin: 0,
      bankPurchaseValue: 0,
      pricingSnapshot: null,
      matchingSnapshot: null,
      createdAt: now,
      assignedAt: null,
      acceptedAt: null,
      arrivedAt: null,
      verifiedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelReason: null,
      cancelledBy: null,
    };

    await pickupRef.set(pickupData);
    await this.logEvent(pickupRef.id, null, "REQUESTED", dto.customerId, "customer");

    return { id: pickupRef.id, status: "REQUESTED" };
  }

  /**
   * Transition a pickup to a new status — validates against state machine
   */
  async transitionPickup(
    pickupId: string,
    newStatus: PickupStatus,
    actorId: string,
    actorRole: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const pickupDoc = await this.pickups.doc(pickupId).get();
    if (!pickupDoc.exists) {
      throw new BadRequestException("Pickup not found");
    }

    const current = pickupDoc.data()!;
    const currentStatus = current.status as PickupStatus;
    const allowed = PICKUP_STATE_MACHINE[currentStatus];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(", ")}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: newStatus,
    };

    const now = FieldValue.serverTimestamp();

    switch (newStatus) {
      case "MATCHING":
        break;
      case "ASSIGNED":
        updateData.assignedAt = now;
        break;
      case "ACCEPTED":
        updateData.acceptedAt = now;
        break;
      case "ARRIVED":
        updateData.arrivedAt = now;
        break;
      case "VERIFYING":
        break;
      case "COMPLETED":
        updateData.completedAt = now;
        break;
      case "CANCELLED":
        updateData.cancelledAt = now;
        updateData.cancelReason = metadata?.reason || null;
        updateData.cancelledBy = actorId;
        break;
      case "EXPIRED":
        break;
      case "DISPUTED":
        break;
      case "FAILED":
        break;
    }

    await this.pickups.doc(pickupId).update(updateData);
    await this.logEvent(pickupId, currentStatus, newStatus, actorId, actorRole, metadata);
  }

  /**
   * Assign a collector to a pickup
   */
  async assignCollector(
    pickupId: string,
    collectorId: string,
    collectorName: string,
    matchingSnapshot: Record<string, unknown>,
  ): Promise<void> {
    await this.pickups.doc(pickupId).update({
      collectorId,
      collectorName,
      matchingSnapshot,
    });
    await this.transitionPickup(pickupId, "ASSIGNED", collectorId, "collector");
  }

  /**
   * Collector accepts the pickup
   */
  async acceptPickup(pickupId: string, collectorId: string): Promise<void> {
    await this.transitionPickup(pickupId, "ACCEPTED", collectorId, "collector");
  }

  /**
   * Collector starts en route
   */
  async startEnRoute(pickupId: string, collectorId: string): Promise<void> {
    await this.transitionPickup(pickupId, "EN_ROUTE", collectorId, "collector");
  }

  /**
   * Collector arrives (geofence or manual)
   */
  async arriveAtPickup(pickupId: string, collectorId: string): Promise<void> {
    await this.transitionPickup(pickupId, "ARRIVED", collectorId, "collector");
  }

  /**
   * Submit verification result
   */
  async submitVerification(
    pickupId: string,
    collectorId: string,
    verifiedWeight: number,
    finalValue: number,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.pickups.doc(pickupId).update({
      verifiedWeight,
      finalValue,
      verifiedAt: FieldValue.serverTimestamp(),
    });
    await this.transitionPickup(pickupId, "VERIFYING", collectorId, "collector", metadata);
  }

  /**
   * Customer confirms verification result
   */
  async customerConfirm(pickupId: string, customerId: string): Promise<void> {
    await this.transitionPickup(pickupId, "COMPLETED", customerId, "customer");
  }

  /**
   * Cancel a pickup
   */
  async cancelPickup(
    pickupId: string,
    actorId: string,
    actorRole: string,
    reason: string,
  ): Promise<void> {
    await this.transitionPickup(pickupId, "CANCELLED", actorId, actorRole, { reason });
  }

  /**
   * Check if weight deviation requires re-confirmation (>50%)
   */
  checkWeightDeviation(estimatedWeight: number, verifiedWeight: number): boolean {
    if (estimatedWeight === 0) return false;
    const deviation = Math.abs(verifiedWeight - estimatedWeight) / estimatedWeight;
    return deviation > 0.5;
  }

  /**
   * Get a single pickup by ID
   */
  async getPickup(pickupId: string): Promise<Record<string, unknown> | null> {
    const doc = await this.pickups.doc(pickupId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  /**
   * Get pickups for a customer
   */
  async getCustomerPickups(customerId: string, limit = 20) {
    const snapshot = await this.pickups
      .where("customerId", "==", customerId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get available pickups for a collector (status = MATCHING or ASSIGNED to them)
   */
  async getAvailablePickups(regionId: string) {
    const snapshot = await this.pickups
      .where("status", "in", ["MATCHING"])
      .where("regionId", "==", regionId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get active pickup for a collector
   */
  async getCollectorActivePickup(collectorId: string) {
    const snapshot = await this.pickups
      .where("collectorId", "==", collectorId)
      .where("status", "in", ["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "VERIFYING"])
      .limit(1)
      .get();

    return snapshot.docs.length > 0
      ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      : null;
  }

  /**
   * Log a pickup event
   */
  private async logEvent(
    pickupId: string,
    fromStatus: PickupStatus | null,
    toStatus: PickupStatus,
    actorId: string,
    actorRole: string,
    metadata?: Record<string, unknown>,
  ) {
    const eventRef = this.events.doc();
    await eventRef.set({
      id: eventRef.id,
      pickupId,
      fromStatus,
      toStatus,
      actorId,
      actorRole,
      metadata: metadata || null,
      timestamp: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}
