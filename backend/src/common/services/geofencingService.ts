import { Injectable } from "@nestjs/common";
import { GeoLocation } from "@/common/types";

/**
 * Geofencing Service
 *
 * Thresholds:
 * - ≤500m = Near
 * - ≤100m = Auto Arrived
 * - Fallback: Manual Arrived
 */
@Injectable()
export class GeofencingService {
  private readonly NEAR_THRESHOLD = 500; // meters
  private readonly ARRIVED_THRESHOLD = 100; // meters

  /**
   * Check geofence status based on collector location vs pickup location
   */
  checkGeofence(
    collectorLocation: GeoLocation,
    pickupLocation: GeoLocation,
  ): {
    status: "far" | "near" | "arrived";
    distanceMeters: number;
    canAutoArrive: boolean;
  } {
    const distanceMeters = this.calculateDistanceMeters(collectorLocation, pickupLocation);

    if (distanceMeters <= this.ARRIVED_THRESHOLD) {
      return { status: "arrived", distanceMeters, canAutoArrive: true };
    }

    if (distanceMeters <= this.NEAR_THRESHOLD) {
      return { status: "near", distanceMeters, canAutoArrive: false };
    }

    return { status: "far", distanceMeters, canAutoArrive: false };
  }

  /**
   * Calculate distance between two coordinates in meters
   */
  calculateDistanceMeters(loc1: GeoLocation, loc2: GeoLocation): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLon = this.toRad(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(loc1.lat)) *
        Math.cos(this.toRad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Validate tracking timestamp (should be within last 30 seconds)
   */
  validateTrackingTimestamp(timestamp: Date, maxAgeSeconds = 30): boolean {
    const now = Date.now();
    const trackingTime = timestamp.getTime();
    const ageSeconds = (now - trackingTime) / 1000;
    return ageSeconds <= maxAgeSeconds;
  }

  /**
   * Check for abnormal GPS movement
   * If collector moves more than 100km in 5 seconds, it's suspicious
   */
  checkAbnormalMovement(
    previousLocation: GeoLocation,
    currentLocation: GeoLocation,
    timeDeltaSeconds: number,
    maxSpeedKmh = 200,
  ): boolean {
    const distanceMeters = this.calculateDistanceMeters(previousLocation, currentLocation);
    const distanceKm = distanceMeters / 1000;
    const timeHours = timeDeltaSeconds / 3600;
    const speedKmh = timeHours > 0 ? distanceKm / timeHours : Infinity;

    return speedKmh > maxSpeedKmh;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
