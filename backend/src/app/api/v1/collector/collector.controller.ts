import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { PickupService } from "@/common/services/pickupService";
import { CollectorService } from "@/common/services/collectorService";
import { GeofencingService } from "@/common/services/geofencingService";
import { AuditService } from "@/common/services/auditService";

@Controller("v1/collector")
export class CollectorController {
  constructor(
    private readonly pickupService: PickupService,
    private readonly collectorService: CollectorService,
    private readonly geofencingService: GeofencingService,
    private readonly auditService: AuditService,
  ) {}

  @Get("available-jobs")
  @UseGuards(AuthGuard)
  async getAvailableJobs(@Req() req: any) {
    const collector = await this.collectorService.getCollector(req.user.uid);
    const regionId = (collector as any)?.regionId || "bandung";
    const jobs = await this.pickupService.getAvailablePickups(regionId);
    return { success: true, data: jobs };
  }

  @Get("active-pickup")
  @UseGuards(AuthGuard)
  async getActivePickup(@Req() req: any) {
    const pickup = await this.pickupService.getCollectorActivePickup(req.user.uid);
    return pickup
      ? { success: true, data: pickup }
      : { success: true, data: null };
  }

  @Post("pickups/:id/accept")
  @UseGuards(AuthGuard)
  async acceptPickup(@Req() req: any, @Param("id") id: string) {
    await this.pickupService.acceptPickup(id, req.user.uid);

    await this.auditService.log({
      actorId: req.user.uid,
      actorRole: "collector",
      action: AuditService.ACTIONS.COLLECTOR_ACCEPTED_PICKUP,
      entityType: "pickup",
      entityId: id,
    });

    return { success: true, status: "ACCEPTED" };
  }

  @Post("pickups/:id/en-route")
  @UseGuards(AuthGuard)
  async startEnRoute(@Req() req: any, @Param("id") id: string) {
    await this.pickupService.startEnRoute(id, req.user.uid);
    return { success: true, status: "EN_ROUTE" };
  }

  @Post("pickups/:id/arrive")
  @UseGuards(AuthGuard)
  async arrive(@Req() req: any, @Param("id") id: string) {
    await this.pickupService.arriveAtPickup(id, req.user.uid);
    return { success: true, status: "ARRIVED" };
  }

  @Post("pickups/:id/verify")
  @UseGuards(AuthGuard)
  async submitVerification(
    @Req() req: any,
    @Param("id") id: string,
    @Body()
    body: {
      verifiedWeight: number;
      grade?: string;
      condition?: string;
      notes?: string;
    },
  ) {
    // Check weight deviation
    const pickup = await this.pickupService.getPickup(id);
    if (pickup) {
      const needsReconfirmation = this.pickupService.checkWeightDeviation(
        (pickup as any).estimatedWeight,
        body.verifiedWeight,
      );

      if (needsReconfirmation) {
        return {
          success: true,
          status: "NEEDS_RECONFIRMATION",
          message: "Weight deviation >50% — customer re-confirmation required",
        };
      }
    }

    await this.pickupService.submitVerification(id, req.user.uid, body.verifiedWeight, 0);
    return { success: true, status: "VERIFYING" };
  }

  @Post("pickups/:id/reject")
  @UseGuards(AuthGuard)
  async rejectPickup(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { reason?: string },
  ) {
    await this.pickupService.cancelPickup(
      id,
      req.user.uid,
      "collector",
      body.reason || "Collector rejected",
    );

    await this.auditService.log({
      actorId: req.user.uid,
      actorRole: "collector",
      action: AuditService.ACTIONS.COLLECTOR_REJECTED_PICKUP,
      entityType: "pickup",
      entityId: id,
    });

    return { success: true, status: "CANCELLED" };
  }

  @Post("location")
  @UseGuards(AuthGuard)
  async updateLocation(
    @Req() req: any,
    @Body() body: { lat: number; lng: number; accuracy: number },
  ) {
    await this.collectorService.updateLocation(req.user.uid, body.lat, body.lng, body.accuracy);
    return { success: true };
  }

  @Get("profile")
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    const profile = await this.collectorService.getCollector(req.user.uid);
    return profile
      ? { success: true, data: profile }
      : { success: false, error: "Collector profile not found" };
  }

  @Get("earnings")
  @UseGuards(AuthGuard)
  async getEarnings(@Req() req: any) {
    const earnings = await this.collectorService.getEarnings(req.user.uid);
    return { success: true, data: earnings };
  }
}
