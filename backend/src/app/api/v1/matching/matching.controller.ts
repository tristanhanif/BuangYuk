import { Controller, Post, Get, Param, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { MatchingService } from "@/common/services/matchingService";
import { PickupService } from "@/common/services/pickupService";
import { AuditService } from "@/common/services/auditService";
import { MatchingWeights } from "@/common/types";

@Controller("v1/matching")
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly pickupService: PickupService,
    private readonly auditService: AuditService,
  ) {}

  @Post(":pickupId/match")
  @UseGuards(AuthGuard)
  async matchPickup(
    @Param("pickupId") pickupId: string,
    @Body() body: { weights?: MatchingWeights },
  ) {
    const pickup = await this.pickupService.getPickup(pickupId);
    if (!pickup) {
      return { success: false, error: "Pickup not found" };
    }

    // Transition to MATCHING
    await this.pickupService.transitionPickup(
      pickupId,
      "MATCHING",
      "system",
      "admin",
    );

    // Run matching engine
    const result = await this.matchingService.findBestCollector(
      (pickup as any).pickupLocation,
      (pickup as any).regionId,
      (pickup as any).estimatedWeight,
      body.weights,
    );

    if (result.bestCandidate) {
      // Auto-assign the best candidate
      await this.pickupService.assignCollector(
        pickupId,
        result.bestCandidate.collectorId,
        result.bestCandidate.displayName,
        result.snapshot,
      );

      await this.auditService.log({
        actorId: "system",
        actorRole: "admin",
        action: AuditService.ACTIONS.COLLECTOR_ASSIGNED,
        entityType: "pickup",
        entityId: pickupId,
        after: {
          collectorId: result.bestCandidate.collectorId,
          score: result.bestCandidate.totalScore,
        },
      });

      return {
        success: true,
        assigned: true,
        collector: result.bestCandidate,
        allCandidates: result.allCandidates,
      };
    }

    return {
      success: true,
      assigned: false,
      message: "No eligible collectors found",
      candidates: result.allCandidates,
    };
  }

  @Post(":pickupId/reassign")
  @UseGuards(AuthGuard)
  async reassignPickup(
    @Param("pickupId") pickupId: string,
    @Body() body: { excludeCollectorId?: string },
  ) {
    const pickup = await this.pickupService.getPickup(pickupId);
    if (!pickup) {
      return { success: false, error: "Pickup not found" };
    }

    // Re-run matching with exclusion
    const result = await this.matchingService.findBestCollector(
      (pickup as any).pickupLocation,
      (pickup as any).regionId,
      (pickup as any).estimatedWeight,
      undefined,
      body.excludeCollectorId,
    );

    if (result.bestCandidate) {
      await this.pickupService.assignCollector(
        pickupId,
        result.bestCandidate.collectorId,
        result.bestCandidate.displayName,
        result.snapshot,
      );

      return { success: true, collector: result.bestCandidate };
    }

    return { success: false, message: "No alternative collectors found" };
  }
}
