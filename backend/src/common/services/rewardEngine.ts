import { Injectable } from "@nestjs/common";

@Injectable()
export class RewardEngine {
  calculateEcoPoints(weightKg: number, co2eSaved: number): number {
    const Rw = 10;
    const Rc = 50;
    return Math.round((weightKg * Rw) + (co2eSaved * Rc));
  }

  calculateCashReward(weightKg: number, basePricePerKg: number): number {
    return Math.floor(weightKg * basePricePerKg);
  }
}