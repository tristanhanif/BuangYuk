import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { PickupService } from "@/common/services/pickupService";
import { PricingService } from "@/common/services/pricingService";
import { AuditService } from "@/common/services/auditService";

@Controller("v1/pickups")
export class PickupsController {
  constructor(
    private readonly pickupService: PickupService,
    private readonly pricingService: PricingService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPickup(@Req() req: any, @Body() body: any) {
    const userId = req.user.uid;
    const displayName = req.user.name || "Customer";

    if (!body.wasteItems || !Array.isArray(body.wasteItems) || body.wasteItems.length === 0) {
      throw new ForbiddenException("wasteItems must be a non-empty array");
    }

    // Calculate pricing for each waste item
    let totalEstimatedValue = 0;
    for (const item of body.wasteItems) {
      const { totalPrice } = await this.pricingService.calculatePrice(
        item.categoryId,
        item.grade || "B",
        item.condition || "mixed",
        body.regionId,
        item.weightKg,
      );
      totalEstimatedValue += totalPrice;
    }

    const result = await this.pickupService.createPickup({
      customerId: userId,
      customerName: displayName,
      regionId: body.regionId,
      wasteItems: body.wasteItems,
      estimatedWeight: body.estimatedWeight,
      estimatedValue: totalEstimatedValue,
      pickupLocation: body.pickupLocation,
      pickupAddress: body.pickupAddress,
      proofPhotoUrls: body.proofPhotoUrls || [],
      notes: body.notes,
      preferredTime: body.preferredTime,
    });

    await this.auditService.log({
      actorId: userId,
      actorRole: "customer",
      action: AuditService.ACTIONS.PICKUP_CREATED,
      entityType: "pickup",
      entityId: result.id,
      after: { status: "REQUESTED", estimatedValue: totalEstimatedValue },
    });

    return { success: true, ...result };
  }

  @Get("my")
  @UseGuards(AuthGuard)
  async getMyPickups(@Req() req: any) {
    const pickups = await this.pickupService.getCustomerPickups(req.user.uid);
    return { success: true, data: pickups };
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async getPickup(@Req() req: any, @Param("id") id: string) {
    const pickup = await this.pickupService.getPickup(id);
    if (!pickup) {
      return { success: false, error: "Pickup not found" };
    }
    // Ownership check: only customer, collector, or admin can view
    const pickupData = pickup as any;
    if (pickupData.customerId !== req.user.uid && pickupData.collectorId !== req.user.uid) {
      throw new ForbiddenException("You can only view your own pickups");
    }
    return { success: true, data: pickup };
  }

  @Post(":id/cancel")
  @UseGuards(AuthGuard)
  async cancelPickup(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { reason: string },
  ) {
    const pickup = await this.pickupService.getPickup(id);
    if (!pickup) throw new ForbiddenException("Pickup not found");
    if ((pickup as any).customerId !== req.user.uid) {
      throw new ForbiddenException("You can only cancel your own pickups");
    }
    await this.pickupService.cancelPickup(id, req.user.uid, "customer", body.reason);
    return { success: true, status: "CANCELLED" };
  }

  @Post(":id/confirm")
  @UseGuards(AuthGuard)
  async confirmPickup(@Req() req: any, @Param("id") id: string) {
    const pickup = await this.pickupService.getPickup(id);
    if (!pickup) throw new ForbiddenException("Pickup not found");
    if ((pickup as any).customerId !== req.user.uid) {
      throw new ForbiddenException("You can only confirm your own pickups");
    }
    await this.pickupService.customerConfirm(id, req.user.uid);
    return { success: true, status: "COMPLETED" };
  }
}
