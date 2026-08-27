import Module from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CarbonCalculator } from "@/common/services/carbonCalculator";
import { RewardEngine } from "@/common/services/rewardEngine";
import { TransactionService } from "@/common/services/transactionService";
import { NotificationService } from "@/common/services/notificationService";
import { AuthGuard } from "@/common/guards/authGuard";
import { RoleGuard } from "@/common/guards/roleGuard";
import { CategoriesController } from "@/app/api/v1/categories/categories.controller";
import { TransactionsController } from "@/app/api/v1/transactions/transactions.controller";
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
    WebhooksController,
    HealthController,
  ],
  providers: [
    AuthGuard,
    RoleGuard,
    TransactionService,
    CarbonCalculator,
    RewardEngine,
    NotificationService,
  ],
})
export class AppModule {}