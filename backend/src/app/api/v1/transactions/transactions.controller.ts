import { Controller, Post, Get, UseGuards, Body, Req, BadRequestException } from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { RoleGuard } from "@/common/guards/roleGuard";
import { wasteSchema, verificationSchema, rewardSchema } from "@/common/validators";
import { CarbonCalculator } from "@/common/services/carbonCalculator";
import { TransactionService } from "@/common/services/transactionService";
import { NotificationService } from "@/common/services/notificationService";

@Controller("v1/transactions")
export class TransactionsController {
  constructor(
    private readonly calculator: CarbonCalculator,
    private readonly transactionService: TransactionService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async submitWasteDraft(@Body() body: any) {
    const parsed = wasteSchema.parse(body);
    const result = await this.calculator.calculate(parsed);

    const mockTransactionId = `tx_${Date.now()}`;

    return {
      success: true,
      transactionId: mockTransactionId,
      estimatedCo2eSaved: result.co2eSaved,
      status: "PENDING",
    };
  }

  @Post("verify")
  @UseGuards(AuthGuard, new (RoleGuard)(["VERIFIER", "ADMIN"]))
  async verifyWasteTransaction(@Req() req: any, @Body() body: any) {
    const parsed = verificationSchema.parse(body);
    const result = await this.transactionService.executeVerificationTransaction(
      parsed.transactionId,
      parsed.verifiedWeightKg,
      parsed.adjustedSubCategoryId
    );

    await this.notificationService.sendVerificationNotification(
      req.user.uid,
      parsed.transactionId,
      result.verifiedCo2eSaved,
      result.earnedEcoPoints
    );

    return {
      success: result.success,
      ...result,
    };
  }

  @Post("reward/redeem")
  @UseGuards(AuthGuard)
  async redeemReward(@Req() req: any, @Body() body: any) {
    const parsed = rewardSchema.parse(body);
    return {
      success: true,
      userId: req.user.uid,
      ...parsed,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  getTransactions() {
    return {
      success: true,
      data: [],
    };
  }
}
