import { Injectable, BadRequestException } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";
import { OrderStatus } from "@/common/types";

const ORDER_STATE_MACHINE: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID"],
  PAID: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
};

/**
 * Marketplace Service
 *
 * Connects Customer with UMKM.
 * Order Lifecycle: PENDING → PAID → PROCESSING → SHIPPED → DELIVERED → COMPLETED
 * Auto-complete: 3 days after Delivered
 * Commission: 10% (configurable)
 */
@Injectable()
export class MarketplaceService {
  private get products() {
    return firestore.collection("marketplace_products");
  }

  private get orders() {
    return firestore.collection("marketplace_orders");
  }

  private get orderEvents() {
    return firestore.collection("marketplace_order_events");
  }

  /**
   * Create a product listing (UMKM)
   */
  async createProduct(params: {
    sellerId: string;
    sellerName: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    additionalImages?: string[];
    stock: number;
    materialsUsed?: string[];
    isRecycled: boolean;
    regionId: string;
  }) {
    const productRef = this.products.doc();

    await productRef.set({
      id: productRef.id,
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      name: params.name,
      description: params.description,
      price: params.price,
      category: params.category,
      imageUrl: params.imageUrl,
      additionalImages: params.additionalImages || [],
      stock: params.stock,
      materialsUsed: params.materialsUsed || [],
      isRecycled: params.isRecycled,
      regionId: params.regionId,
      isActive: true,
      rating: 0,
      totalSold: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return productRef.id;
  }

  /**
   * Browse products
   */
  async browseProducts(params: {
    regionId?: string;
    category?: string;
    isRecycled?: boolean;
    limit?: number;
  }) {
    let query: FirebaseFirestore.Query = this.products.where("isActive", "==", true);

    if (params.regionId) {
      query = query.where("regionId", "==", params.regionId);
    }
    if (params.category) {
      query = query.where("category", "==", params.category);
    }
    if (params.isRecycled !== undefined) {
      query = query.where("isRecycled", "==", params.isRecycled);
    }

    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(params.limit || 20)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Create an order
   */
  async createOrder(params: {
    buyerId: string;
    buyerName: string;
    productId: string;
    quantity: number;
    shippingAddress: string;
    commissionRate: number;
  }) {
    const productDoc = await this.products.doc(params.productId).get();
    if (!productDoc.exists) {
      throw new BadRequestException("Product not found");
    }

    const product = productDoc.data()!;
    if (product.stock < params.quantity) {
      throw new BadRequestException("Insufficient stock");
    }

    const totalPrice = product.price * params.quantity;
    const commission = Math.round(totalPrice * params.commissionRate);
    const sellerReceives = totalPrice - commission;
    const shippingFee = 5000; // Mock shipping fee

    const orderRef = this.orders.doc();
    await orderRef.set({
      id: orderRef.id,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      productId: params.productId,
      productName: product.name,
      quantity: params.quantity,
      unitPrice: product.price,
      totalPrice,
      shippingFee,
      commission,
      sellerReceives,
      status: "PENDING",
      shippingAddress: params.shippingAddress,
      trackingNumber: null,
      shippedAt: null,
      deliveredAt: null,
      completedAt: null,
      autoCompleteAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Decrease stock atomically
    await this.products.doc(params.productId).update({
      stock: FieldValue.increment(-params.quantity),
    });

    await this.logOrderEvent(orderRef.id, null, "PENDING", params.buyerId);

    return { orderId: orderRef.id, totalPrice, commission, sellerReceives };
  }

  /**
   * Transition order status
   */
  async transitionOrder(
    orderId: string,
    newStatus: OrderStatus,
    actorId: string,
    metadata?: Record<string, unknown>,
  ) {
    const orderDoc = await this.orders.doc(orderId).get();
    if (!orderDoc.exists) {
      throw new BadRequestException("Order not found");
    }

    const current = orderDoc.data()!;
    const currentStatus = current.status as OrderStatus;
    const allowed = ORDER_STATE_MACHINE[currentStatus];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(", ")}`,
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };

    switch (newStatus) {
      case "PAID":
        // Payment confirmed
        break;
      case "PROCESSING":
        // UMKM starts processing
        break;
      case "SHIPPED":
        updateData.shippedAt = FieldValue.serverTimestamp();
        updateData.trackingNumber = metadata?.trackingNumber || `TRK-${Date.now()}`;
        break;
      case "DELIVERED":
        updateData.deliveredAt = FieldValue.serverTimestamp();
        // Set auto-complete 3 days later
        const autoCompleteAt = new Date();
        autoCompleteAt.setDate(autoCompleteAt.getDate() + 3);
        updateData.autoCompleteAt = autoCompleteAt;
        break;
      case "COMPLETED":
        updateData.completedAt = FieldValue.serverTimestamp();
        // Credit seller
        break;
    }

    await this.orders.doc(orderId).update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await this.logOrderEvent(orderId, currentStatus, newStatus, actorId, metadata);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string) {
    const doc = await this.orders.doc(orderId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  /**
   * Get buyer's orders
   */
  async getBuyerOrders(buyerId: string, limit = 20) {
    const snapshot = await this.orders
      .where("buyerId", "==", buyerId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get seller's orders
   */
  async getSellerOrders(sellerId: string, limit = 20) {
    const snapshot = await this.orders
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Log order event
   */
  private async logOrderEvent(
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    actorId: string,
    metadata?: Record<string, unknown>,
  ) {
    const eventRef = this.orderEvents.doc();
    await eventRef.set({
      id: eventRef.id,
      orderId,
      fromStatus,
      toStatus,
      actorId,
      metadata: metadata || null,
      timestamp: FieldValue.serverTimestamp(),
    });
  }
}
