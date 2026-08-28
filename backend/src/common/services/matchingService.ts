import { Injectable } from "@nestjs/common";
import { firestore } from "@/common/firebaseAdmin";
import { GeoLocation, MatchingWeights, DEFAULT_MATCHING_WEIGHTS } from "@/common/types";

interface CollectorCandidate {
  userId: string;
  displayName: string;
  regionId: string;
  reliabilityScore: number;
  totalPickups: number;
  completedPickups: number;
  acceptanceRate: number;
  isActive: boolean;
  currentLat?: number;
  currentLng?: number;
  currentLoadKg: number;
  maxCapacityKg: number;
}

export interface ScoredCandidate {
  collectorId: string;
  displayName: string;
  distanceScore: number;
  reliabilityScore: number;
  capacityScore: number;
  availabilityScore: number;
  experienceScore: number;
  regionFitScore: number;
  totalScore: number;
}

@Injectable()
export class MatchingService {
  /**
   * Find the best collector for a pickup using Weighted Scoring Engine
   *
   * Formula:
   * Score = Distance × 25%
   *       + Reliability × 25%
   *       + Capacity × 15%
   *       + Availability × 15%
   *       + Experience × 10%
   *       + Region Fit × 10%
   *
   * All weights configurable.
   */
  async findBestCollector(
    pickupLocation: GeoLocation,
    regionId: string,
    estimatedWeight: number,
    weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS,
    excludeCollectorId?: string,
  ): Promise<{
    bestCandidate: ScoredCandidate | null;
    allCandidates: ScoredCandidate[];
    snapshot: Record<string, unknown>;
  }> {
    // Step 1: Find eligible collectors
    let eligibleCollectors = await this.getEligibleCollectors(regionId, estimatedWeight);

    // Exclude specific collector if reassignment
    if (excludeCollectorId) {
      eligibleCollectors = eligibleCollectors.filter(c => c.userId !== excludeCollectorId);
    }

    if (eligibleCollectors.length === 0) {
      return {
        bestCandidate: null,
        allCandidates: [],
        snapshot: {
          algorithm: "weighted_scoring",
          weights,
          score: 0,
          candidatesEvaluated: 0,
          capturedAt: new Date(),
        },
      };
    }

    // Step 2: Score each candidate
    const scored = eligibleCollectors.map((collector) =>
      this.scoreCandidate(collector, pickupLocation, regionId, estimatedWeight, weights),
    );

    // Step 3: Rank by total score (descending)
    scored.sort((a, b) => b.totalScore - a.totalScore);

    // Step 4: Return the best candidate
    const best = scored[0];

    return {
      bestCandidate: best,
      allCandidates: scored,
      snapshot: {
        algorithm: "weighted_scoring",
        weights,
        score: best.totalScore,
        candidatesEvaluated: scored.length,
        capturedAt: new Date(),
      },
    };
  }

  /**
   * Score a single candidate against the pickup request
   */
  private scoreCandidate(
    collector: CollectorCandidate,
    pickupLocation: GeoLocation,
    regionId: string,
    estimatedWeight: number,
    weights: MatchingWeights,
  ): ScoredCandidate {
    const distanceScore = this.calculateDistanceScore(
      collector.currentLat,
      collector.currentLng,
      pickupLocation,
    );
    const reliabilityScore = this.calculateReliabilityScore(collector);
    const capacityScore = this.calculateCapacityScore(collector, estimatedWeight);
    const availabilityScore = this.calculateAvailabilityScore(collector);
    const experienceScore = this.calculateExperienceScore(collector);
    const regionFitScore = this.calculateRegionFitScore(collector, regionId);

    const totalScore =
      distanceScore * weights.distance +
      reliabilityScore * weights.reliability +
      capacityScore * weights.capacity +
      availabilityScore * weights.availability +
      experienceScore * weights.experience +
      regionFitScore * weights.regionFit;

    return {
      collectorId: collector.userId,
      displayName: collector.displayName,
      distanceScore,
      reliabilityScore,
      capacityScore,
      availabilityScore,
      experienceScore,
      regionFitScore,
      totalScore: Math.round(totalScore * 1000) / 1000,
    };
  }

  /**
   * Distance Score: closer = higher score (max 50km baseline)
   */
  private calculateDistanceScore(
    collectorLat?: number,
    collectorLng?: number,
    pickupLocation?: GeoLocation,
  ): number {
    if (!collectorLat || !collectorLng || !pickupLocation) return 0.5;

    const distanceKm = this.haversineDistance(
      collectorLat,
      collectorLng,
      pickupLocation.lat,
      pickupLocation.lng,
    );

    // Score decreases with distance, 0km = 1.0, 50km = 0.0
    const maxDistance = 50;
    return Math.max(0, 1 - distanceKm / maxDistance);
  }

  /**
   * Reliability Score: based on completion rate and reliability score
   */
  private calculateReliabilityScore(collector: CollectorCandidate): number {
    const completionRate =
      collector.totalPickups > 0
        ? collector.completedPickups / collector.totalPickups
        : 0;

    // Weighted combination of reliability score (0-100) and completion rate
    const reliabilityNorm = collector.reliabilityScore / 100;
    return reliabilityNorm * 0.6 + completionRate * 0.4;
  }

  /**
   * Capacity Score: can the collector handle this load?
   */
  private calculateCapacityScore(collector: CollectorCandidate, estimatedWeight: number): number {
    const availableCapacity = collector.maxCapacityKg - collector.currentLoadKg;
    if (availableCapacity <= 0) return 0;
    if (availableCapacity >= estimatedWeight) return 1.0;
    return availableCapacity / estimatedWeight;
  }

  /**
   * Availability Score: is the collector currently available?
   */
  private calculateAvailabilityScore(collector: CollectorCandidate): number {
    if (!collector.isActive) return 0;
    // Check if collector has no active pickup
    return 1.0;
  }

  /**
   * Experience Score: based on total pickups completed
   */
  private calculateExperienceScore(collector: CollectorCandidate): number {
    // Logarithmic scale: 0 pickups = 0, 100+ pickups = ~1.0
    const maxPickups = 100;
    return Math.min(1, Math.log(collector.completedPickups + 1) / Math.log(maxPickups + 1));
  }

  /**
   * Region Fit Score: is the collector in the same region?
   */
  private calculateRegionFitScore(collector: CollectorCandidate, regionId: string): number {
    return collector.regionId === regionId ? 1.0 : 0.3;
  }

  /**
   * Get eligible collectors from Firestore — filtered by region
   */
  private async getEligibleCollectors(
    regionId: string,
    estimatedWeight: number,
  ): Promise<CollectorCandidate[]> {
    const snapshot = await firestore
      .collection("collectors")
      .where("isActive", "==", true)
      .where("regionId", "==", regionId)
      .get();

    return snapshot.docs
      .map((doc) => ({ userId: doc.id, ...doc.data() } as CollectorCandidate))
      .filter((c) => {
        // Must have capacity
        const availableCapacity = c.maxCapacityKg - c.currentLoadKg;
        return availableCapacity >= estimatedWeight * 0.5;
      });
  }

  /**
   * Haversine distance between two coordinates (in km)
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
