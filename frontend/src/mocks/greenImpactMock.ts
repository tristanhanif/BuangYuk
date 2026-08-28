export interface GreenImpactData {
  co2SavedTotal: number;
  co2Trend: { period: string; co2Kg: number }[];
  treeEquivalence: number;
  treeProgressToNext: number;
  user: { name: string; level: "bronze" | "silver" | "gold"; mascotStage: 1 | 2 | 3 | 4 };
}

export const greenImpactMock: GreenImpactData = {
  co2SavedTotal: 63,
  co2Trend: [
    { period: "Minggu 1", co2Kg: 8 },
    { period: "Minggu 2", co2Kg: 12 },
    { period: "Minggu 3", co2Kg: 15 },
    { period: "Minggu 4", co2Kg: 28 },
  ],
  treeEquivalence: 3,
  treeProgressToNext: 0,
  user: { name: "Rina", level: "silver", mascotStage: 3 },
};
