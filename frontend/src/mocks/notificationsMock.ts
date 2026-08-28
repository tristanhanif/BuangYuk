import type { NotificationItemProps } from "@/components/feature/NotificationItem";

export interface AppNotification extends Omit<NotificationItemProps, "timestamp"> {
  id: string;
  timestamp: string;
}

const now = Date.now();
const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

export const notificationsMock: AppNotification[] = [
  {
    id: "n1",
    type: "transaction",
    title: "Penukaran berhasil!",
    body: "Tas Belanja Daur Ulang Plastik berhasil kamu tukar. Cek riwayat penukaran untuk detail.",
    timestamp: new Date(now - 2 * HOUR).toISOString(),
    isRead: false,
  },
  {
    id: "n2",
    type: "pickup",
    title: "Penjemputan dijadwalkan",
    body: "Petugas akan menjemput sampahmu besok pukul 09.00. Siapkan sampah terpilah ya!",
    timestamp: new Date(now - 5 * HOUR).toISOString(),
    isRead: false,
  },
  {
    id: "n3",
    type: "badge",
    title: "Badge baru terbuka!",
    body: "Selamat! Kamu membuka badge Carbon Hero karena menyelamatkan 50kg CO₂e.",
    timestamp: new Date(now - DAY).toISOString(),
    isRead: true,
  },
  {
    id: "n4",
    type: "transaction",
    title: "Setoran dikonfirmasi",
    body: "Setoran plastik 2,5kg telah dikonfirmasi. +1.300 Poin masuk ke akunmu.",
    timestamp: new Date(now - 2 * DAY).toISOString(),
    isRead: true,
  },
  {
    id: "n5",
    type: "promo",
    title: "Program tukar poin spesial",
    body: "Tukar 2.000 poin untuk mendapatkan pot bunga dari botol bekas. Hanya minggu ini!",
    timestamp: new Date(now - 4 * DAY).toISOString(),
    isRead: true,
  },
];
