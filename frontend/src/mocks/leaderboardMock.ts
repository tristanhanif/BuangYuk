import type { LeaderboardRowProps } from "@/components/feature/LeaderboardRow";

export interface LeaderboardEntry extends LeaderboardRowProps {
  id: string;
}

export const leaderboardGlobalMock: LeaderboardEntry[] = [
  { id: "lb-1", rank: 1, avatarUrl: "https://placehold.co/96x96?text=R1", name: "Rina", xp: 3200, isCurrentUser: true },
  { id: "lb-2", rank: 2, avatarUrl: "https://placehold.co/96x96?text=R2", name: "Budi Santoso", xp: 2950 },
  { id: "lb-3", rank: 3, avatarUrl: "https://placehold.co/96x96?text=R3", name: "Siti Aminah", xp: 2710 },
  { id: "lb-4", rank: 4, avatarUrl: "https://placehold.co/96x96?text=R4", name: "Agus Wijaya", xp: 2400 },
  { id: "lb-5", rank: 5, avatarUrl: "https://placehold.co/96x96?text=R5", name: "Dewi Lestari", xp: 2180 },
  { id: "lb-6", rank: 6, avatarUrl: "https://placehold.co/96x96?text=R6", name: "Eko Prasetyo", xp: 1990 },
  { id: "lb-7", rank: 7, avatarUrl: "https://placehold.co/96x96?text=R7", name: "Fitri Handayani", xp: 1750 },
  { id: "lb-8", rank: 8, avatarUrl: "https://placehold.co/96x96?text=R8", name: "Gilang Ramadhan", xp: 1620 },
  { id: "lb-9", rank: 9, avatarUrl: "https://placehold.co/96x96?text=R9", name: "Hana Safitri", xp: 1480 },
  { id: "lb-10", rank: 10, avatarUrl: "https://placehold.co/96x96?text=R10", name: "Irfan Maulana", xp: 1310 },
  { id: "lb-11", rank: 11, avatarUrl: "https://placehold.co/96x96?text=R11", name: "Joko Susilo", xp: 1240 },
  { id: "lb-12", rank: 12, avatarUrl: "https://placehold.co/96x96?text=R12", name: "Kartika Putri", xp: 1180 },
  { id: "lb-13", rank: 13, avatarUrl: "https://placehold.co/96x96?text=R13", name: "Lukman Hakim", xp: 1090 },
  { id: "lb-14", rank: 14, avatarUrl: "https://placehold.co/96x96?text=R14", name: "Maya Anggraini", xp: 980 },
  { id: "lb-15", rank: 15, avatarUrl: "https://placehold.co/96x96?text=R15", name: "Nanda Pratama", xp: 920 },
  { id: "lb-16", rank: 16, avatarUrl: "https://placehold.co/96x96?text=R16", name: "Oscar Wibowo", xp: 850 },
  { id: "lb-17", rank: 17, avatarUrl: "https://placehold.co/96x96?text=R17", name: "Putri Rahayu", xp: 790 },
  { id: "lb-18", rank: 18, avatarUrl: "https://placehold.co/96x96?text=R18", name: "Qori Ananda", xp: 740 },
  { id: "lb-19", rank: 19, avatarUrl: "https://placehold.co/96x96?text=R19", name: "Rudi Hartono", xp: 690 },
  { id: "lb-20", rank: 20, avatarUrl: "https://placehold.co/96x96?text=R20", name: "Sari Dewi", xp: 640 },
];

export const leaderboardCityMock: LeaderboardEntry[] = [
  { id: "lb-c1", rank: 1, avatarUrl: "https://placehold.co/96x96?text=R1", name: "Rina", xp: 3200, isCurrentUser: true },
  { id: "lb-c2", rank: 2, avatarUrl: "https://placehold.co/96x96?text=R2", name: "Tono", xp: 1450 },
  { id: "lb-c3", rank: 3, avatarUrl: "https://placehold.co/96x96?text=R3", name: "Umar", xp: 1200 },
  { id: "lb-c4", rank: 4, avatarUrl: "https://placehold.co/96x96?text=R4", name: "Vina", xp: 980 },
  { id: "lb-c5", rank: 5, avatarUrl: "https://placehold.co/96x96?text=R5", name: "Wawan", xp: 760 },
];
