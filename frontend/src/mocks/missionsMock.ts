import type { MissionCardProps } from "@/components/feature/MissionCard";

export type MissionPeriod = "harian" | "mingguan" | "bulanan";

export interface Mission extends MissionCardProps {
  id: string;
  period: MissionPeriod;
}

export const missionsMock: Mission[] = [
  {
    id: "m-harian-1",
    period: "harian",
    title: "Setor Botol Plastik",
    description: "Setor minimal 0,5 kg botol plastik hari ini",
    currentProgress: 0.3,
    targetProgress: 0.5,
    unit: "kg",
    xpReward: 25,
    pointsReward: 125,
    status: "in_progress",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "m-harian-2",
    period: "harian",
    title: "Pilah Kertas Bersih",
    description: "Pisahkan kertas/karton bersih untuk disetor",
    currentProgress: 2,
    targetProgress: 1,
    unit: "kg",
    xpReward: 20,
    pointsReward: 100,
    status: "completed",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "m-harian-3",
    period: "harian",
    title: "Hidrasi Tanpa Plastik",
    description: "Kumpulkan 3 botol kaca bekas minuman",
    currentProgress: 3,
    targetProgress: 3,
    unit: "botol",
    xpReward: 30,
    pointsReward: 150,
    status: "claimed",
  },
  {
    id: "m-mingguan-1",
    period: "mingguan",
    title: "Rajin Memilah",
    description: "Setor total 3 kg plastik/kertas dalam seminggu",
    currentProgress: 2.2,
    targetProgress: 3,
    unit: "kg",
    xpReward: 150,
    pointsReward: 500,
    status: "in_progress",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "m-mingguan-2",
    period: "mingguan",
    title: "Setor 2x Seminggu",
    description: "Lakukan minimal 2 setoran dalam seminggu",
    currentProgress: 1,
    targetProgress: 2,
    unit: "setoran",
    xpReward: 120,
    pointsReward: 400,
    status: "in_progress",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: "m-bulanan-1",
    period: "bulanan",
    title: "Pahlawan Daur Ulang",
    description: "Setor total 10 kg sampah dalam sebulan",
    currentProgress: 6.5,
    targetProgress: 10,
    unit: "kg",
    xpReward: 500,
    pointsReward: 2000,
    status: "in_progress",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
];

export const missionPeriods: MissionPeriod[] = ["harian", "mingguan", "bulanan"];

export const PERIOD_LABEL: Record<MissionPeriod, string> = {
  harian: "Harian",
  mingguan: "Mingguan",
  bulanan: "Bulanan",
};
