import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { RoleGuard } from "@/common/guards/roleGuard";
import { AdminService } from "@/common/services/adminService";
import { FraudDetectionService } from "@/common/services/fraudDetectionService";
import { DisputeService } from "@/common/services/disputeService";
import { AuditService } from "@/common/services/auditService";
import { PricingService } from "@/common/services/pricingService";

@Controller("v1/admin")
@UseGuards(AuthGuard, new RoleGuard(["admin"]))
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly fraudService: FraudDetectionService,
    private readonly disputeService: DisputeService,
    private readonly auditService: AuditService,
    private readonly pricingService: PricingService,
  ) {}

  @Get("analytics")
  async getAnalytics() {
    const analytics = await this.adminService.getAnalytics();
    return { success: true, data: analytics };
  }

  @Get("active-pickups")
  async getActivePickups() {
    const pickups = await this.adminService.getActivePickups();
    return { success: true, data: pickups };
  }

  @Get("failed-pickups")
  async getFailedPickups() {
    const pickups = await this.adminService.getFailedPickups();
    return { success: true, data: pickups };
  }

  @Get("fraud-flags")
  async getFraudFlags() {
    const flags = await this.fraudService.getFlaggedItems();
    return { success: true, data: flags };
  }

  @Post("fraud-flags/:id/review")
  async reviewFraudFlag(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { status: string; reviewNotes?: string },
  ) {
    const result = await this.fraudService.reviewFlag(id, req.user.uid, body.status as any, body.reviewNotes);
    return { success: true, ...result };
  }

  @Get("disputes")
  async getDisputes() {
    const disputes = await this.disputeService.getOpenDisputes();
    return { success: true, data: disputes };
  }

  @Get("audit-logs")
  async getAuditLogs() {
    const logs = await this.auditService.getAllLogs();
    return { success: true, data: logs };
  }

  @Get("config/:configId")
  async getConfig(@Param("configId") configId: string) {
    const config = await this.adminService.getConfig(configId);
    return config
      ? { success: true, data: config }
      : { success: false, error: "Config not found" };
  }

  @Put("config/:configId")
  async updateConfig(
    @Req() req: any,
    @Param("configId") configId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const result = await this.adminService.updateConfig(configId, body, req.user.uid);
    return { success: true, ...result };
  }

  @Get("pricing")
  async getPricing() {
    const config = await this.adminService.getCommissionConfig();
    return { success: true, data: config };
  }

  @Put("pricing")
  async updatePricing(@Req() req: any, @Body() body: any) {
    await this.adminService.updateConfig("commission", body, req.user.uid);
    return { success: true };
  }
}
