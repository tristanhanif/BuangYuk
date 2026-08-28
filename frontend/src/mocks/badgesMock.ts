import {
  Leaf,
  Droplet,
  Globe,
  Newspaper,
  Wine,
  Flame,
  Users,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface BadgeData {
  id: string;
  name: string;
  icon: LucideIcon;
  unlocked: boolean;
  unlockedAt: string | null;
  requirement: string;
  progress?: number;
}

export const badgesMock: BadgeData[] = [
  {
    id: "first-deposit",
    name: "First Deposit",
    icon: Leaf,
    unlocked: true,
    unlockedAt: "2025-01-12",
    requirement: "Setor sampah pertama kali",
    progress: 1,
  },
  {
    id: "plastic-slayer",
    name: "Plastic Slayer",
    icon: Droplet,
    unlocked: true,
    unlockedAt: "2025-02-03",
    requirement: "Total setor plastik ≥ 10 kg",
    progress: 1,
  },
  {
    id: "carbon-hero",
    name: "Carbon Hero",
    icon: Globe,
    unlocked: true,
    unlockedAt: "2025-02-10",
    requirement: "Total CO2 saved ≥ 50 kg",
    progress: 1,
  },
  {
    id: "paper-saver",
    name: "Paper Saver",
    icon: Newspaper,
    unlocked: false,
    unlockedAt: null,
    requirement: "Total setor kertas ≥ 10 kg",
    progress: 0.4,
  },
  {
    id: "glass-guardian",
    name: "Glass Guardian",
    icon: Wine,
    unlocked: false,
    unlockedAt: null,
    requirement: "Total setor kaca ≥ 5 kg",
    progress: 0,
  },
  {
    id: "streak-warrior",
    name: "Streak Warrior",
    icon: Flame,
    unlocked: false,
    unlockedAt: null,
    requirement: "Setor sampah 4 minggu berturut-turut",
    progress: 0.5,
  },
  {
    id: "community-hero",
    name: "Community Hero",
    icon: Users,
    unlocked: false,
    unlockedAt: null,
    requirement: "Masuk top 10 leaderboard kota",
    progress: 0,
  },
  {
    id: "top-contributor",
    name: "Top Contributor",
    icon: Trophy,
    unlocked: false,
    unlockedAt: null,
    requirement: "Masuk top 3 leaderboard global",
    progress: 0,
  },
];
