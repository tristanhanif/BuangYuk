import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { WalletService } from "@/common/services/walletService";
import { AuditService } from "@/common/services/auditService";

@Controller("v1/wallet")
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getWallet(@Req() req: any) {
    const wallet = await this.walletService.getOrCreateWallet(req.user.uid);
    return { success: true, data: wallet };
  }

  @Get("transactions")
  @UseGuards(AuthGuard)
  async getTransactions(@Req() req: any) {
    const transactions = await this.walletService.getTransactions(req.user.uid);
    return { success: true, data: transactions };
  }

  @Post("cashout")
  @UseGuards(AuthGuard)
  async requestCashout(
    @Req() req: any,
    @Body() body: { amount: number },
  ) {
    if (!body.amount || typeof body.amount !== "number" || body.amount <= 0 || !Number.isFinite(body.amount)) {
      throw new BadRequestException("Invalid cashout amount");
    }

    const result = await this.walletService.requestCashout(req.user.uid, body.amount);

    await this.auditService.log({
      actorId: req.user.uid,
      actorRole: "customer",
      action: AuditService.ACTIONS.WALLET_WITHDRAWAL_REQUESTED,
      entityType: "wallet",
      entityId: req.user.uid,
      after: { amount: body.amount, cashoutId: result.cashoutId },
    });

    return { success: true, ...result };
  }
}
