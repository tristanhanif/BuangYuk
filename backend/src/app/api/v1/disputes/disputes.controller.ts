import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { RoleGuard } from "@/common/guards/roleGuard";
import { DisputeService } from "@/common/services/disputeService";
import { AuditService } from "@/common/services/auditService";

@Controller("v1/disputes")
export class DisputesController {
  constructor(
    private readonly disputeService: DisputeService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createDispute(
    @Req() req: any,
    @Body()
    body: {
      pickupId: string;
      category: string;
      description: string;
      evidencePhotoUrls?: string[];
    },
  ) {
    const result = await this.disputeService.createDispute({
      pickupId: body.pickupId,
      customerId: req.user.uid,
      customerName: req.user.name || "Customer",
      category: body.category as any,
      description: body.description,
      evidencePhotoUrls: body.evidencePhotoUrls,
    });

    await this.auditService.log({
      actorId: req.user.uid,
      actorRole: "customer",
      action: AuditService.ACTIONS.DISPUTE_CREATED,
      entityType: "dispute",
      entityId: result.id,
      after: { category: body.category, pickupId: body.pickupId },
    });

    return { success: true, ...result };
  }

  @Get("my")
  @UseGuards(AuthGuard)
  async getMyDisputes(@Req() req: any) {
    const disputes = await this.disputeService.getCustomerDisputes(req.user.uid);
    return { success: true, data: disputes };
  }

  @Get("open")
  @UseGuards(AuthGuard, new RoleGuard(["admin"]))
  async getOpenDisputes() {
    const disputes = await this.disputeService.getOpenDisputes();
    return { success: true, data: disputes };
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async getDispute(@Param("id") id: string) {
    const dispute = await this.disputeService.getDispute(id);
    return dispute
      ? { success: true, data: dispute }
      : { success: false, error: "Dispute not found" };
  }

  @Post(":id/review")
  @UseGuards(AuthGuard, new RoleGuard(["admin"]))
  async reviewDispute(@Req() req: any, @Param("id") id: string) {
    await this.disputeService.reviewDispute(id, req.user.uid);
    return { success: true, status: "UNDER_REVIEW" };
  }

  @Post(":id/resolve")
  @UseGuards(AuthGuard, new RoleGuard(["admin"]))
  async resolveDispute(
    @Req() req: any,
    @Param("id") id: string,
    @Body()
    body: {
      resolution: string;
      resolutionNotes: string;
      adjustmentAmount?: number;
    },
  ) {
    const result = await this.disputeService.resolveDispute(
      id,
      req.user.uid,
      body.resolution as any,
      body.resolutionNotes,
      body.adjustmentAmount,
    );

    await this.auditService.log({
      actorId: req.user.uid,
      actorRole: "admin",
      action: AuditService.ACTIONS.DISPUTE_RESOLVED,
      entityType: "dispute",
      entityId: id,
      after: { resolution: body.resolution },
    });

    return { success: true, ...result };
  }
}
