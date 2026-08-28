import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { MarketplaceService } from "@/common/services/marketplaceService";
import { AuditService } from "@/common/services/auditService";

@Controller("v1/marketplace")
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly auditService: AuditService,
  ) {}

  @Get("products")
  async browseProducts(
    @Query("regionId") regionId?: string,
    @Query("category") category?: string,
    @Query("isRecycled") isRecycled?: string,
    @Query("limit") limit?: string,
  ) {
    const products = await this.marketplaceService.browseProducts({
      regionId,
      category,
      isRecycled: isRecycled === "true" ? true : isRecycled === "false" ? false : undefined,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return { success: true, data: products };
  }

  @Post("products")
  @UseGuards(AuthGuard)
  async createProduct(@Req() req: any, @Body() body: any) {
    const productId = await this.marketplaceService.createProduct({
      sellerId: req.user.uid,
      sellerName: req.user.name || "Seller",
      ...body,
    });
    return { success: true, productId };
  }

  @Get("orders")
  @UseGuards(AuthGuard)
  async getOrders(@Req() req: any) {
    const orders = await this.marketplaceService.getBuyerOrders(req.user.uid);
    return { success: true, data: orders };
  }

  @Get("orders/:id")
  @UseGuards(AuthGuard)
  async getOrder(@Param("id") id: string) {
    const order = await this.marketplaceService.getOrder(id);
    return order
      ? { success: true, data: order }
      : { success: false, error: "Order not found" };
  }

  @Post("orders")
  @UseGuards(AuthGuard)
  async createOrder(@Req() req: any, @Body() body: any) {
    const result = await this.marketplaceService.createOrder({
      buyerId: req.user.uid,
      buyerName: req.user.name || "Buyer",
      productId: body.productId,
      quantity: body.quantity,
      shippingAddress: body.shippingAddress,
      commissionRate: 0.10,
    });

    await this.auditService.log({
      actorId: req.user.uid,
      actorRole: "customer",
      action: AuditService.ACTIONS.ORDER_CREATED,
      entityType: "order",
      entityId: result.orderId,
      after: { totalPrice: result.totalPrice },
    });

    return { success: true, ...result };
  }

  @Post("orders/:id/ship")
  @UseGuards(AuthGuard)
  async shipOrder(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { trackingNumber?: string },
  ) {
    const order = await this.marketplaceService.getOrder(id) as any;
    if (!order) throw new ForbiddenException("Order not found");
    if (order.sellerId !== req.user.uid) throw new ForbiddenException("Only the seller can ship this order");

    await this.marketplaceService.transitionOrder(id, "SHIPPED", req.user.uid, {
      trackingNumber: body.trackingNumber,
    });

    await this.auditService.log({
      actorId: req.user.uid,
      actorRole: "umkm",
      action: AuditService.ACTIONS.ORDER_SHIPPED,
      entityType: "order",
      entityId: id,
    });

    return { success: true, status: "SHIPPED" };
  }

  @Post("orders/:id/complete")
  @UseGuards(AuthGuard)
  async completeOrder(@Req() req: any, @Param("id") id: string) {
    const order = await this.marketplaceService.getOrder(id) as any;
    if (!order) throw new ForbiddenException("Order not found");
    if (order.buyerId !== req.user.uid) throw new ForbiddenException("Only the buyer can complete this order");

    await this.marketplaceService.transitionOrder(id, "COMPLETED", req.user.uid);

    await this.auditService.log({
      actorId: req.user.uid,
      actorRole: "customer",
      action: AuditService.ACTIONS.ORDER_COMPLETED,
      entityType: "order",
      entityId: id,
    });

    return { success: true, status: "COMPLETED" };
  }
}
