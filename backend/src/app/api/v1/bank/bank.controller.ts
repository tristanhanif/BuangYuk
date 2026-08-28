import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { BankSampahService } from "@/common/services/bankSampahService";

@Controller("v1/bank")
@UseGuards(AuthGuard)
export class BankController {
  constructor(private readonly bankService: BankSampahService) {}

  @Get("dashboard")
  async getDashboard(@Req() req: any) {
    const bankId = req.user.uid;
    const dashboard = await this.bankService.getBankDashboard(bankId);
    return { success: true, data: dashboard };
  }

  @Get("capacity")
  async getCapacity(@Req() req: any) {
    const bankId = req.user.uid;
    const capacity = await this.bankService.getTodayCapacity(bankId);
    return { success: true, data: capacity };
  }

  @Get("settlements")
  async getSettlements(@Req() req: any) {
    // TODO: implement get settlements for bank
    return { success: true, data: [] };
  }

  @Post("settlements/:id/confirm")
  async confirmSettlement(@Req() req: any, @Param("id") id: string) {
    await this.bankService.confirmSettlement(id, req.user.uid);
    return { success: true, status: "confirmed" };
  }

  @Post("settlements/:id/settle")
  async settlePayment(@Req() req: any, @Param("id") id: string) {
    await this.bankService.settlePayment(id);
    return { success: true, status: "settled" };
  }

  @Get("fallback/:regionId")
  async findFallback(
    @Req() req: any,
    @Param("regionId") regionId: string,
    @Query("excludeBankId") excludeBankId?: string,
    @Query("weightKg") weightKg?: string,
  ) {
    const partner = await this.bankService.findFallbackPartner(
      regionId,
      excludeBankId || "",
      weightKg ? parseFloat(weightKg) : 0,
    );
    return partner
      ? { success: true, data: partner }
      : { success: false, message: "No fallback partner found" };
  }
}
