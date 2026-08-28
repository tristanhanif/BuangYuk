export interface BankSampah {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  hours: string;
  phone?: string;
}

export const bankSampahMock: BankSampah[] = [
  {
    id: "bs1",
    name: "Bank Sampah Bina Warga",
    address: "Jl. Melati No. 12, RT 03/RW 05",
    lat: -6.2004,
    lng: 106.8092,
    distanceKm: 0.8,
    hours: "Senin–Sabtu, 08.00–16.00",
    phone: "0812-3456-7890",
  },
  {
    id: "bs2",
    name: "Bank Sampah Harapan Jaya",
    address: "Jl. Anggrek No. 45, RT 07/RW 02",
    lat: -6.2106,
    lng: 106.8156,
    distanceKm: 1.6,
    hours: "Senin–Jumat, 09.00–17.00",
    phone: "0813-9876-5432",
  },
  {
    id: "bs3",
    name: "Bank Sampah Griya Lestari",
    address: "Jl. Kenanga Raya No. 8, RT 02/RW 04",
    lat: -6.1931,
    lng: 106.8023,
    distanceKm: 2.9,
    hours: "Setiap hari, 07.00–15.00",
    phone: "0821-1111-2222",
  },
  {
    id: "bs4",
    name: "Bank Sampah Bakti Lingkungan",
    address: "Jl. Mawar No. 22, RT 01/RW 03",
    lat: -6.2217,
    lng: 106.8167,
    distanceKm: 4.2,
    hours: "Senin, Rabu, Jumat, 09.00–14.00",
    phone: "0857-4433-2211",
  },
];

export const RADIUS_OPTIONS = [
  { id: "1", label: "1 km", value: 1 },
  { id: "5", label: "5 km", value: 5 },
  { id: "10", label: "10 km", value: 10 },
];

export const MAP_CENTER: [number, number] = [-6.2088, 106.8456];
