import { Controller, Post, Get, UseGuards, Body } from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { RoleGuard } from "@/common/guards/roleGuard";
import { wasteSchema, verificationSchema, rewardSchema } from "@/common/validators";
import { CarbonCalculator } from "@/common/services/carbonCalculator";
import { TransactionService } from "@/common/services/transactionService";
import { NotificationService } from "@/common/services/notificationService";

@Controller("v1/transactions")
export class TransactionsController {
  private calculator = new CarbonCalculator();
  private transactionService = new TransactionService();
  private notificationService = new NotificationService();

  @Post()
  @UseGuards(AuthGuard)
  submitWasteDraft(@Body() body: any) {
    const parsed = wasteSchema.parse(body);
    const result = this.calculator.calculate(parsed);

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
  async verifyWasteTransaction(@Body() body: any) {
    const parsed = verificationSchema.parse(body);
    const result = await this.transactionService.executeVerificationTransaction(
      parsed.transactionId,
      parsed.verifiedWeightKg,
      parsed.adjustedSubCategoryId
    );

    this.notificationService.sendVerificationNotification(
      "user_123",
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
  async redeemReward(@Body() body: any) {
    const parsed = rewardSchema.parse(body);
    return {
      success: true,
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
