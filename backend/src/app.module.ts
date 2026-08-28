import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CarbonCalculator } from "@/common/services/carbonCalculator";
import { RewardEngine } from "@/common/services/rewardEngine";
import { TransactionService } from "@/common/services/transactionService";
import { NotificationService } from "@/common/services/notificationService";
import { PickupService } from "@/common/services/pickupService";
import { MatchingService } from "@/common/services/matchingService";
import { PricingService } from "@/common/services/pricingService";
import { WalletService } from "@/common/services/walletService";
import { DisputeService } from "@/common/services/disputeService";
import { AuditService } from "@/common/services/auditService";
import { FraudDetectionService } from "@/common/services/fraudDetectionService";
import { GeofencingService } from "@/common/services/geofencingService";
import { CollectorService } from "@/common/services/collectorService";
import { BankSampahService } from "@/common/services/bankSampahService";
import { MarketplaceService } from "@/common/services/marketplaceService";
import { AdminService } from "@/common/services/adminService";
import { AuthGuard } from "@/common/guards/authGuard";
import { CategoriesController } from "@/app/api/v1/categories/categories.controller";
import { TransactionsController } from "@/app/api/v1/transactions/transactions.controller";
import { PickupsController } from "@/app/api/v1/pickups/pickups.controller";
import { MatchingController } from "@/app/api/v1/matching/matching.controller";
import { WalletController } from "@/app/api/v1/wallet/wallet.controller";
import { DisputesController } from "@/app/api/v1/disputes/disputes.controller";
import { MarketplaceController } from "@/app/api/v1/marketplace/marketplace.controller";
import { AdminController } from "@/app/api/v1/admin/admin.controller";
import { CollectorController } from "@/app/api/v1/collector/collector.controller";
import { BankController } from "@/app/api/v1/bank/bank.controller";
import { WebhooksController } from "@/app/api/v1/webhooks/webhooks.controller";
import { HealthController } from "@/app/api/health/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    CategoriesController,
    TransactionsController,
    PickupsController,
    MatchingController,
    WalletController,
    DisputesController,
    MarketplaceController,
    AdminController,
    CollectorController,
    BankController,
    WebhooksController,
    HealthController,
  ],
  providers: [
    AuthGuard,
    TransactionService,
    CarbonCalculator,
    RewardEngine,
    NotificationService,
    PickupService,
    MatchingService,
    PricingService,
    WalletService,
    DisputeService,
    AuditService,
    FraudDetectionService,
    GeofencingService,
    CollectorService,
    BankSampahService,
    MarketplaceService,
    AdminService,
  ],
})
export class AppModule {}