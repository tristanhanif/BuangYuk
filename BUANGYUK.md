# PRD — Bagian Arts (UI/Visual Layer)
## BuangYuk — Waste2Wealth / EcoLoop
### Versi Extended — Detail Implementasi Penuh untuk AI Coding Agent

---

# DAFTAR ISI

1. Ruang Lingkup & Prinsip Kerja
2. Tech Stack & Asumsi Teknis
3. Sumber Data & Verifikasi (Trustworthy Data)
4. Design System Lengkap (Design Tokens)
5. Copy Guidelines & Voice/Tone
6. Component Library — Spesifikasi Penuh (Props, State, Varian)
7. Spesifikasi Halaman Lengkap (Layout, Copy, Data, Interaksi)
8. Micro-interactions & Animasi
9. Struktur Folder & Konvensi Kode
10. Aset Visual — Spesifikasi Produksi
11. Accessibility Checklist
12. Responsive Behavior per Breakpoint
13. Error Handling & Edge Case UI
14. Data Dummy Final (Konsisten, Terverifikasi)
15. QA Checklist & Definition of Done
16. Di Luar Scope Arts

---

# 1. Ruang Lingkup & Prinsip Kerja

Dokumen ini HANYA mencakup **lapisan tampilan (presentation layer)**: komponen UI, styling, layout, aset visual, copy text, dan interaksi visual. Tidak mencakup:
- Logic bisnis di server (perhitungan harga/CO2/XP final ada di backend, Arts hanya menampilkan hasil via props)
- Autentikasi/otorisasi asli
- Koneksi database/API sungguhan
- Payment gateway asli

**Prinsip kerja untuk AI coding agent:**
1. Semua komponen menerima data lewat **props dengan tipe TypeScript eksplisit** — tidak ada data hardcode di dalam JSX kecuali label/copy statis.
2. Semua data dinamis (angka, list) berasal dari file mock di `/src/mocks/`, supaya tim Tech tinggal mengganti isi file itu dengan hasil fetch API tanpa mengubah struktur komponen manapun.
3. Setiap halaman WAJIB mengimplementasikan 4 kondisi render: `loading`, `empty`, `error`, `success` — bukan cuma kondisi "data selalu ada".
4. Setiap komponen visual harus memakai **token desain** (warna, spacing, tipografi) dari Bagian 4 — dilarang menulis hex/px baru langsung di komponen.
5. Semua teks antarmuka (copy) memakai Bahasa Indonesia sesuai Bagian 5 — bukan placeholder Lorem Ipsum atau bahasa Inggris campur aduk.

---

# 2. Tech Stack & Asumsi Teknis

| Layer | Pilihan | Alasan |
|---|---|---|
| Build tool | Vite | Startup cepat, cocok untuk timeline lomba yang ketat |
| Framework | React 18 + TypeScript | Type-safety penting supaya kontrak data antara Arts↔Tech jelas |
| Styling | Tailwind CSS 3.x | Cepat untuk konsistensi design token, gampang di-generate AI agent |
| Routing | React Router v6 | Standar, mendukung nested route untuk detail halaman |
| Charts | Recharts | Ringan, komponen React native, cocok untuk line chart CO2 & pie chart statistik |
| Maps | react-leaflet + OpenStreetMap tiles | Gratis, tidak perlu API key (beda dengan Google Maps yang berbayar/perlu key) |
| Icon dasar | lucide-react | Set ikon konsisten, tree-shakeable |
| Animasi | Framer Motion (opsional, untuk transisi halaman & micro-interaction) | Native React, deklaratif |
| Export gambar (Share Card) | html-to-image atau dom-to-image-more | Untuk convert komponen React jadi PNG/JPEG 9:16 |
| Form handling | React Hook Form + Zod (validasi) | Validasi form konsisten (Input Sampah, Register, dll) |
| State lokal | React Context API | Cukup untuk layer UI; tidak perlu Redux/Zustand karena tidak ada state kompleks lintas halaman di sisi Arts |

> **Catatan penting:** stack ini adalah rekomendasi default. Kalau tim Tech (yang mengerjakan backend) sudah menentukan stack lain (misalnya Next.js untuk SSR, atau butuh integrasi spesifik), lapisan komponen di dokumen ini tetap valid — cukup sesuaikan cara routing/fetching, struktur komponen dan props tidak perlu berubah.

---

# 3. Sumber Data & Verifikasi (Trustworthy Data)

Bagian ini penting supaya angka yang dipakai di dashboard/demo tidak sekadar karangan, dan supaya kamu bisa menjawab kalau juri tanya "datanya dari mana".

### 3.1 Komposisi Sampah Indonesia (Sumber: SIPSN — Sistem Informasi Pengelolaan Sampah Nasional, KLHK)

Data SIPSN KLHK 2024 mencatat proporsi sampah sisa makanan sekitar 39,36%, sampah plastik 19,64% (naik dari 15,88% di 2019), sampah kayu/ranting 12,62%, dan kertas/karton 11,16%. Data yang lebih baru (2025) menunjukkan total timbulan sampah nasional 25,14 juta ton dengan 40,76% berupa sisa makanan, dan mayoritas sampah berasal dari rumah tangga (56,7%).

**Angka final yang dipakai untuk pie chart (dibulatkan dari data SIPSN 2024, sumber resmi: sipsn.menlhk.go.id/sipsn/public/data/komposisi):**

| Kategori | Persentase | Sumber |
|---|---|---|
| Sisa Makanan/Organik | 39,4% | SIPSN KLHK 2024 |
| Plastik | 19,6% | SIPSN KLHK 2024 |
| Kayu/Ranting | 12,6% | SIPSN KLHK 2024 |
| Kertas/Karton | 11,2% | SIPSN KLHK 2024 |
| Lainnya (Logam, Kaca, Tekstil, Karet, Elektronik) | 17,2% | Sisa dari total 100% |

> Cantumkan link resmi di footer/slide presentasi: `sipsn.menlhk.go.id`

### 3.2 Faktor Emisi CO2 per Jenis Sampah (Sumber: EPA WARM — Waste Reduction Model)

**Catatan kejujuran data (penting):** angka "kg CO2 dikurangi per kg sampah didaur ulang" yang sering beredar di internet itu **bukan angka presisi tunggal yang diakui resmi secara universal** — nilainya bervariasi tergantung versi model WARM, satuan asli (short ton vs metric ton), dan metodologi (source reduction vs recycling vs landfill-avoidance). EPA sendiri menyatakan bahwa net pengurangan emisi dari daur ulang sampah campuran (kertas, logam, plastik) dibanding jika dibuang ke TPA adalah sekitar 2,83 metric ton CO2 ekuivalen per short ton sampah yang didaur ulang — ini angka gabungan, bukan per material tunggal.

Karena aplikasi ini untuk **demo lomba** (bukan laporan ilmiah/ESG resmi), rekomendasi kami: pakai **angka pendekatan yang dibulatkan**, dengan disclaimer jelas di UI bahwa ini estimasi berbasis EPA WARM, bukan angka sertifikasi karbon resmi.

**Angka pendekatan final (dibulatkan, per kg, untuk keperluan UI/demo):**

| Jenis Sampah | Estimasi CO2 Dikurangi | Catatan |
|---|---|---|
| Plastik (PET/HDPE campuran) | ≈ 1,5 kg CO2e / kg | Estimasi pendekatan dari faktor emisi plastik EPA WARM |
| Kertas/Karton | ≈ 2,0 kg CO2e / kg | Faktor kertas karton relatif tinggi di beberapa dataset WARM |
| Logam/Kaleng Aluminium | ≈ 4 kg CO2e / kg | Daur ulang aluminium punya penghematan emisi tertinggi di antara material umum |
| Kaca | ≈ 0,3 kg CO2e / kg | Penghematan emisi paling rendah karena proses daur ulang kaca butuh energi peleburan besar |

> **WAJIB dicantumkan di halaman Edukasi/Tips atau footer Green Impact:** *"Estimasi dampak karbon dihitung menggunakan pendekatan dari EPA Waste Reduction Model (WARM), dibulatkan untuk kebutuhan simulasi aplikasi — bukan angka sertifikasi karbon resmi."* Ini justru jadi nilai plus di mata juri karena menunjukkan kejujuran metodologi, bukan klaim data palsu.

### 3.3 Ekuivalensi Pohon (Eco-Widget)

Angka umum yang dipakai berbagai kalkulator dampak lingkungan (termasuk EPA GHG Equivalencies Calculator) adalah 1 pohon dewasa menyerap sekitar 20–22 kg CO2 per tahun. Untuk konsistensi rumus di aplikasi, **dipakai angka tetap 21 kg CO2/tahun/pohon** (titik tengah dari rentang yang umum dipakai), dengan rumus:

```
Jumlah Pohon Digital = Total CO2 Saved ÷ 21
```

> Sama seperti poin 3.2, cantumkan disclaimer serupa: *"Estimasi ekuivalensi pohon berdasarkan rata-rata penyerapan karbon pohon dewasa (sumber: EPA GHG Equivalencies), digunakan sebagai ilustrasi dampak, bukan pengukuran ilmiah presisi."*

### 3.4 Rata-Rata Sampah Rumah Tangga

Untuk menentukan target misi yang realistis, gunakan asumsi bahwa 1 rumah tangga (3–4 orang) di Indonesia rata-rata menghasilkan sampah dalam skala kilogram per minggu untuk kategori anorganik terpilah (plastik/kertas bersih) — ini konsisten dengan proporsi sampah rumah tangga yang mendominasi total timbulan sampah nasional (56,7% menurut data SIPSN 2025). Target misi di Bagian 14 sudah disesuaikan ke skala rumah tangga wajar, bukan target industri.

---

# 4. Design System Lengkap (Design Tokens)

### 4.1 Warna — Tailwind Config Lengkap

```js
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          300: '#6EE7B7',
          500: '#10B981', // DEFAULT — Bright Mint Green
          600: '#059669',
          700: '#047857',
        },
        secondary: {
          50: '#EFF6F8',
          300: '#4E93A5',
          500: '#0F4C5C', // DEFAULT — Deep Teal Blue
          700: '#0A3745',
        },
        accent: {
          100: '#FEF3C7',
          400: '#FBBF24', // DEFAULT — Sunlight Yellow
          600: '#D97706',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F0FDF4', // Soft Mint Cream
          muted: '#F3F4F6',
        },
        status: {
          success: '#10B981',
          warning: '#FBBF24',
          error: '#EF4444',
          info: '#3B82F6',
        },
        level: {
          bronze: '#B08D57',
          silver: '#C0C0C0',
          gold: '#FBBF24',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'Poppins', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 76, 92, 0.08)',
        floating: '0 4px 16px rgba(15, 76, 92, 0.16)',
      }
    }
  }
}
```

### 4.2 Kontras & Aksesibilitas Warna (Wajib Dicek)

| Kombinasi | Rasio Kontras (approx) | Status WCAG AA | Aturan Pakai |
|---|---|---|---|
| `secondary-500` teks di atas `surface` putih | ~9.8:1 | Lolos (normal & besar) | Aman untuk semua teks |
| `primary-500` teks di atas `surface` putih | ~2.5:1 | Gagal untuk teks kecil | JANGAN dipakai untuk teks biasa; hanya untuk elemen besar (icon, angka display ≥24px bold) |
| Teks putih di atas `primary-500` | ~4.6:1 | Lolos (normal text AA) | Aman untuk tombol CTA |
| Teks putih di atas `secondary-500` | ~9.8:1 | Lolos | Aman |
| `accent-400` teks di atas `surface` putih | ~1.9:1 | Gagal | Hanya untuk background badge/ikon, bukan teks |

### 4.3 Tipografi — Implementasi CSS

```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

.text-display { @apply font-heading font-bold text-[32px] leading-tight md:text-[40px]; }
.text-h1       { @apply font-heading font-bold text-2xl leading-snug; }        /* 24px */
.text-h2       { @apply font-heading font-semibold text-lg leading-snug; }      /* 18px */
.text-body     { @apply font-body font-normal text-sm leading-relaxed; }        /* 14px */
.text-body-md  { @apply font-body font-medium text-sm leading-relaxed; }
.text-caption  { @apply font-body font-normal text-xs leading-normal; }         /* 12px */
```

### 4.4 Spacing Scale (Grid 4px)

| Token Tailwind | Nilai | Penggunaan Umum |
|---|---|---|
| `p-1` / `gap-1` | 4px | Jarak antar ikon-teks kecil |
| `p-2` / `gap-2` | 8px | Padding dalam chip/badge kecil |
| `p-4` / `gap-4` | 16px | Padding standar card |
| `p-6` / `gap-6` | 24px | Jarak antar section di halaman |
| `p-8` / `gap-8` | 32px | Margin top halaman di desktop |

### 4.5 Radius & Elevation

| Elemen | Radius | Shadow |
|---|---|---|
| Card besar (dashboard widget, product card) | `rounded-card` (16px) | `shadow-card` |
| Button | `rounded-button` (12px) | none (default), `shadow-floating` untuk FAB |
| Badge/Chip | `rounded-pill` (999px) | none |
| Modal | `rounded-card` (16px) atas saja di mobile (slide-up sheet) | `shadow-floating` |
| Bottom Nav Bar | tidak ada radius (full width) | `shadow-floating` (mengambang di atas konten) |

### 4.6 Breakpoints

| Nama | Min-width | Perubahan Layout Utama |
|---|---|---|
| Mobile (default) | 0px | 1 kolom, Bottom Nav Bar, form full-width |
| `sm:` | 640px | Padding halaman bertambah jadi 24px |
| `md:` (Tablet) | 768px | Grid produk/badge jadi 2–3 kolom, podium leaderboard lebih lebar |
| `lg:` (Desktop) | 1024px | Sidebar Nav menggantikan Bottom Nav, max-width container `1200px`, dashboard jadi grid 2 kolom (widget kiri, chart kanan) |

---

# 5. Copy Guidelines & Voice/Tone

**Prinsip suara aplikasi:** ramah, memotivasi, tidak menggurui, singkat. Gunakan sapaan "kamu", bukan "Anda" (kesan lebih santai & muda). Selalu beri apresiasi setelah aksi positif (setor sampah, klaim misi).

### Contoh Microcopy Wajib (dipakai persis di komponen terkait)

| Konteks | Teks |
|---|---|
| Sapaan Dashboard | "Halo, {nama}!" |
| Tombol CTA utama | "Setor Sampah" |
| Setelah submit setoran berhasil | "Mantap! Setoranmu berhasil dicatat" |
| Progress mascot naik level | "Selamat! Maskotmu berevolusi ke tahap berikutnya" |
| Misi berhasil diklaim | "+{xp} XP & +{poin} Poin masuk ke akunmu!" |
| Saldo poin kurang saat tukar poin | "Poin kamu belum cukup nih. Kurang {selisih} poin lagi." |
| Empty state riwayat | "Belum ada riwayat setoran. Yuk mulai setor sampah pertamamu!" |
| Empty state leaderboard (kota belum ada data) | "Belum ada Pahlawan Hijau di kotamu. Jadilah yang pertama!" |
| Error koneksi generik | "Gagal memuat data. Coba lagi, ya." + tombol "Coba Lagi" |
| Konfirmasi keluar akun | "Yakin mau keluar akun?" (tombol: "Batal" / "Ya, Keluar") |
| Badge terkunci (tooltip saat diklik) | "Syarat: {syarat_badge}. Terus semangat mendaur ulang!" |

---

# 6. Component Library — Spesifikasi Penuh

Semua di `/src/components/ui/*.tsx`. Format: nama komponen, interface props (TypeScript), daftar varian, daftar state, catatan aksesibilitas.

### 6.1 `<Button>`

```ts
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
}
```
- `primary`: bg `primary-500`, teks putih, hover `primary-600`
- `secondary`: border `secondary-500` 1.5px, teks `secondary-500`, bg transparan, hover bg `secondary-50`
- `ghost`: tanpa border/bg, teks `secondary-500`, hover bg `surface-muted`
- `danger`: bg `status-error`, teks putih (untuk aksi "Keluar Akun", "Batalkan")
- Loading state: ganti children dengan spinner + teks "Memproses..." tetap tampil, button disabled otomatis
- Aksesibilitas: wajib `aria-disabled` saat disabled/loading, focus ring `ring-2 ring-primary-300`

### 6.2 `<Card>`

```ts
interface CardProps {
  padding?: 'sm' | 'md' | 'lg'; // 12px / 16px / 24px
  variant?: 'default' | 'soft' | 'outlined';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}
```

### 6.3 `<ProgressBar>`

```ts
interface ProgressBarProps {
  value: number; // 0-100
  color?: 'primary' | 'accent' | 'level-bronze' | 'level-silver' | 'level-gold';
  showLabel?: boolean;
  size?: 'sm' | 'md'; // height 6px / 10px
  animated?: boolean; // animasi width saat mount
}
```

### 6.4 `<BadgeIcon>`

```ts
interface BadgeIconProps {
  iconSrc: string;
  label: string;
  unlocked: boolean;
  size?: 'sm' | 'lg'; // 48px / 96px
  onClick?: () => void;
}
```
Locked state: `filter: grayscale(100%); opacity: 0.4`, tambahkan ikon gembok kecil di pojok kanan bawah.

**Data badge lengkap (dipakai `badgesMock.ts`, lihat Bagian 14.8):**
```ts
interface BadgeData {
  id: string;
  name: string;
  iconSrc: string;       // path SVG; lock state memakai CSS filter (fallback ke file grayscale bila Bagian 10 disiapkan)
  unlocked: boolean;
  unlockedAt: string | null; // ISO date, null jika belum unlock
  requirement: string;       // teks syarat, konsisten dengan Bagian 14.7
  progress?: number;         // 0–1, rasio progress menuju syarat (clamp ke 1 saat unlocked)
}
```

### 6.5 `<StatWidget>`

```ts
interface StatWidgetProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: { direction: 'up' | 'down' | 'neutral'; percentage?: number };
  loading?: boolean;
}
```

### 6.6 `<EmptyState>`

```ts
interface EmptyStateProps {
  illustration: 'empty-history' | 'empty-leaderboard' | 'empty-missions' | 'empty-notification';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

### 6.7 `<LoadingSkeleton>`

```ts
interface LoadingSkeletonProps {
  variant: 'card' | 'list-item' | 'chart' | 'text-line' | 'circle';
  count?: number; // render berulang, misal 3 skeleton list-item
  width?: string;
  height?: string;
}
```
Animasi: shimmer/pulse (`animate-pulse` bawaan Tailwind sudah cukup).

### 6.8 `<Toast>`

```ts
interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // default 3000ms
  onClose: () => void;
}
```
Posisi: fixed bottom, di atas Bottom Nav Bar (mobile), top-right (desktop).

### 6.9 `<BottomNavBar>` / `<SidebarNav>`

```ts
interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badgeCount?: number; // notifikasi unread
}
interface NavBarProps {
  items: NavItem[];
  activePath: string;
}
```
5 item tetap: Dashboard (`/dashboard`), Misi (`/misi`), **Setor Sampah** (`/input-sampah` — tombol tengah lebih besar, floating, warna `primary-500`, ikon plus), Leaderboard (`/leaderboard`), Profil (`/profil`).

### 6.10 `<TopAppBar>`

```ts
interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode; // biasanya ikon notifikasi
  transparent?: boolean; // untuk halaman dengan hero image di belakang
}
```

### 6.11 `<Modal>`

```ts
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  variant?: 'center' | 'bottom-sheet'; // bottom-sheet default untuk mobile
}
```

### 6.12 `<MissionCard>`

```ts
interface MissionCardProps {
  title: string;
  description: string;
  currentProgress: number;
  targetProgress: number;
  unit: string; // "kg"
  xpReward: number;
  pointsReward: number;
  status: 'in_progress' | 'completed' | 'claimed';
  deadline?: string; // ISO date, untuk badge "Berakhir 2 hari lagi"
  onClaim?: () => void;
}
```

### 6.13 `<ProductCard>`

```ts
interface ProductCardProps {
  imageUrl: string;
  name: string;
  priceRp: number;
  pricePoints: number;
  sellerName: string;
  stock: number;
  onClick?: () => void;
}
```
Stock = 0 → tampilkan overlay "Stok Habis" di atas gambar, card tetap bisa diklik untuk lihat detail tapi tombol beli disabled.

### 6.14 `<LeaderboardRow>`

```ts
interface LeaderboardRowProps {
  rank: number;
  avatarUrl: string;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
}
```

### 6.15 `<NotificationItem>`

```ts
interface NotificationItemProps {
  type: 'pickup' | 'transaction' | 'promo' | 'badge';
  title: string;
  body: string;
  timestamp: string; // ISO date
  isRead: boolean;
  onClick?: () => void;
}
```
Ikon per type: `pickup` = truck, `transaction` = wallet, `promo` = gift, `badge` = medal (semua dari lucide-react).

### 6.16 `<LevelBadge>`

```ts
interface LevelBadgeProps {
  level: 'bronze' | 'silver' | 'gold';
  xp: number;
  xpToNextLevel: number | null; // null jika sudah Gold (max level)
  size?: 'sm' | 'lg';
}
```
- Menampilkan nama level (Bronze Recycler / Silver Eco-Warrior / Gold Earth Guardian), rentang/XP, dan progress bar.
- Level aktif di-highlight di tabel Level Ekologi (`/profil/level`).
- Warna: `level-bronze`, `level-silver`, `level-gold` (dari token Bagian 4.1).
- **Hubungan level ↔ mascot (satu sistem):** Mascot adalah visual dari Level Ekologi.
  - Bronze → Eco-Mascot stage 1 (Benih) / stage 2 (Tunas)
  - Silver → Eco-Mascot stage 3 (Pohon Rindang)
  - Gold → Eco-Mascot stage 4 (Earth Guardian)
  - Rujuk Bagian 6.17 & 14.1 untuk mapping eksplisit.

### 6.17 `<EcoMascot>`

```ts
interface EcoMascotProps {
  stage: 1 | 2 | 3 | 4; // Benih, Tunas, Pohon Rindang, Earth Guardian
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean; // idle animation (sedikit gerak/bounce halus)
  message?: string; // teks motivasi di bawah mascot
}
```
- Mascot adalah **representasi visual dari Level Ekologi** (satu sistem, bukan dua progress terpisah). Nilai `stage` diturunkan dari level user:
  - `stage 1` (Benih) → level Bronze, XP 0–250
  - `stage 2` (Tunas) → level Bronze, XP 251–500
  - `stage 3` (Pohon Rindang) → level Silver, XP 501–2.000
  - `stage 4` (Earth Guardian) → level Gold, XP 2.001+
- Evolusi stage terjadi saat ambang XP terlewati (lihat Bagian 8 & 14.1) — tampilkan `<Modal>` "Level Up!" + confetti.
- `message` digunakan untuk microcopy motivasi (mis. "Lanjutkan! Tinggal 3 kg lagi.").

### 6.18 `<WasteCategoryPicker>`

```ts
interface WasteCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  pricePerKg: number;
}
interface WasteCategoryPickerProps {
  categories: WasteCategory[];
  selectedId?: string;
  onSelect: (id: string) => void;
}
```

### 6.19 `<StepIndicator>` (untuk form multi-step Input Sampah)

```ts
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[]; // opsional, label tiap step
}
```

---

# 7. Spesifikasi Halaman Lengkap

Setiap halaman: route path, layout urutan elemen, copy text eksak, data interface, state (loading/empty/error/success), interaksi.

## 7.1 SplashScreen — `/`
- Full screen, background `secondary-500`, logo BuangYuk (putih) di tengah, tagline di bawah logo: **"Setor sampah, panen manfaat"**
- Auto redirect 2 detik ke `/dashboard` (nanti diganti logic cek token oleh tim Tech)
- Tidak ada state loading/error (halaman statis)

## 7.2 Login — `/login`
**Layout:**
- Logo kecil di atas
- `text-h1`: "Masuk ke BuangYuk"
- Input email/no. HP (label: "Email atau Nomor HP", placeholder: "contoh@email.com")
- Input password (label: "Kata Sandi", toggle show/hide dengan ikon mata)
- Link kanan bawah input: "Lupa kata sandi?"
- `<Button variant="primary" fullWidth>` label "Masuk"
- Teks bawah: "Belum punya akun? **Daftar di sini**" (bagian tebal adalah link ke `/register`)

**Validasi (Zod schema):**
- Email/HP wajib diisi, minimal 5 karakter
- Password wajib diisi, minimal 6 karakter
- Error tampil di bawah input masing-masing dengan warna `status-error`, teks: "Email/nomor HP wajib diisi" dll

**Error state (submit gagal, mock):**
- Toast error: "Email/kata sandi salah. Coba lagi."

## 7.3 Daftar — `/register`
Multi-step:
1. **Form Data Diri:** Nama Lengkap, Email, No. HP, Kata Sandi, Konfirmasi Kata Sandi, checkbox "Saya menyetujui Syarat & Ketentuan"
2. **Verifikasi OTP:** 6 kotak input digit terpisah, teks "Kode dikirim ke {email}", tombol "Kirim Ulang Kode" (disabled dengan countdown "Kirim ulang dalam 00:30")
3. Redirect ke `/dashboard` dengan toast: "Akun berhasil dibuat! Selamat datang di BuangYuk"

## 7.4 Dashboard Utama — `/dashboard`

**Urutan layout (mobile, top-to-bottom):**
1. `<TopAppBar>` — kiri: "Halo, {nama}!", kanan: ikon lonceng notifikasi (dot merah jika ada unread)
2. `<EcoMascot>` widget besar (Card, variant soft) — mascot + progress bar XP kecil di bawahnya + teks: "Level {level} • {xp}/{xpTarget} XP"
3. Grid 2x2 `<StatWidget>` (5 widget; baris terakhir menyisakan 1 widget — tetap 2 kolom di mobile):
   - "Saldo Poin" — `{poin} Poin`, ikon coins
   - "Saldo Rapel Cash" — `Rp{balance}`, ikon wallet
   - "CO2 Terselamatkan" — `{co2Total} kg`, ikon leaf
   - "Setoran Pending" — `{count}`, ikon clock
   - "Total Transaksi" — `{count}`, ikon receipt
4. `<Card>` "Statistik Sampahmu" — pie chart Recharts, legend di bawah dengan warna sesuai kategori
5. Quick action row: `<Button variant="primary" size="lg">` "Setor Sampah Sekarang" (full width, paling menonjol) + `<Button variant="ghost">` "Lihat Dampak Hijau →"
6. `<Card>` "Misi Aktif" — judul + link "Lihat Semua" kanan atas, render max 2 `<MissionCard>`

**Data interface:**
```ts
interface DashboardData {
  user: { name: string; level: 'bronze' | 'silver' | 'gold'; xp: number; xpToNextLevel: number; mascotStage: 1|2|3|4 };
  balance: number;            // Saldo Rapel Cash (Rp)
  pointsBalance: number;      // Saldo Poin — dipakai tukar poin & misi
  co2SavedTotal: number;
  pendingDeposits: number;
  transactionCount: number;
  wasteStats: { category: string; percentage: number; color: string }[];
  activeMissions: MissionCardProps[];
}
```

**Loading state:** skeleton untuk mascot card, 5 skeleton stat widget (sesuai 5 widget), skeleton chart
**Empty state:** jika `activeMissions.length === 0` → tampilkan `<EmptyState>` "Belum ada misi aktif" di section itu saja (bukan seluruh halaman)

## 7.5 Input Sampah — `/input-sampah` (5 step, pakai `<StepIndicator>`)

**Step 1 — Pilih Jenis Sampah**
- `text-h1`: "Sampah apa yang mau kamu setor?"
- Grid 2 kolom `<WasteCategoryPicker>` — tiap kategori tampilkan ikon + nama + "mulai Rp{harga}/kg"
- Tombol "Lanjut" disabled sampai ada kategori dipilih

**Step 2 — Input Berat**
- `text-h1`: "Berapa berat sampahnya?"
- Input angka besar di tengah dengan stepper +/- (increment 0.1 kg), satuan "kg" di kanan
- Slider di bawahnya sebagai alternatif input (range 0.1–20 kg)
- Validasi: minimal 0.1 kg, maksimal 20 kg per setoran (mencegah input tidak wajar)

**Step 3 — Estimasi (auto-calculate real-time)**
- `<Card variant="soft">` ringkasan:
  - "Estimasi Pendapatan" — `Rp{harga}` (besar, `text-display`)
  - "Estimasi CO2 Terselamatkan" — `{co2} kg` dengan ikon info (tooltip: disclaimer dari Bagian 3.2)
  - "Bonus yang Didapat" — `+{xp} XP` & `+{poin} Poin`
- Formula ditampilkan sebagai teks kecil `text-caption`: "Dihitung dari: {berat} kg × Rp{harga_per_kg}/kg"

**Step 4 — Lokasi Pick-up**
- List alamat tersimpan (radio select), tiap item: nama alamat, alamat lengkap, ikon rumah/kantor
- Tombol "+ Tambah Alamat Baru" → buka form sederhana (Nama Alamat, Alamat Lengkap, Catatan opsional)

**Step 5 — Konfirmasi**
- Ringkasan semua step sebelumnya dalam list (kategori, berat, estimasi, lokasi)
- `<Button variant="primary" size="lg" fullWidth>` "Submit Setoran"
- Setelah submit → `<Modal>` sukses dengan confetti ringan (Framer Motion), teks: "Setoranmu berhasil dicatat!" + rincian reward → tombol "Lihat Riwayat" atau "Kembali ke Dashboard"

## 7.6 Riwayat Sampah — `/riwayat`
- Tab filter (segmented control): Semua / Pending / Diambil / Dibayar / Selesai
- List item per setoran: ikon kategori, "{kategori} • {berat} kg", tanggal, badge status berwarna (Pending=kuning `status-warning`, Diambil=biru `status-info`, Dibayar=hijau muda, Selesai=hijau `status-success`)
- Empty state per tab: "Belum ada setoran dengan status ini"
- Klik item → `/riwayat/:id` — Detail Setoran dengan `<StepIndicator>` vertikal (Diajukan → Dijemput → Dibayar → Selesai), timestamp tiap tahap

## 7.7 Penukaran Poin — `/tukar-poin`
- Search bar (placeholder: "Cari produk daur ulang...")
- Chip filter kategori horizontal scroll: Semua, Tas & Aksesoris, Dekorasi, Alat Tulis, Lainnya
- Grid `<ProductCard>` 2 kolom mobile / 3 kolom tablet+
- Empty state (hasil search kosong): "Produk tidak ditemukan. Coba kata kunci lain."

**Detail Produk — `/tukar-poin/:id`**
- Galeri gambar (swipeable, dot indicator)
- Nama produk, harga (`Rp{harga}` dan `{poin} Poin` berdampingan)
- Info seller: "Dibuat oleh {nama_umkm}" + badge kecil "UMKM/SMK Binaan"
- Deskripsi produk
- `<Button variant="primary" fullWidth>` "Tukar Sekarang" (sticky di bawah layar)

**Konfirmasi Penukaran (Modal):**
- Ringkasan: gambar kecil produk, nama, harga poin
- "Saldo Poin Kamu: {saldo}" — saldo bersumber dari `DashboardData.pointsBalance` agar selalu sinkron lintas halaman
- Jika cukup: tombol "Konfirmasi Penukaran" aktif
- Jika kurang: tombol disabled, teks merah "Poin kurang {selisih}. Yuk setor sampah lagi!"
- Sukses → Toast "Penukaran berhasil! Cek status di Riwayat Penukaran" + redirect (poin berkurang, DashboardData.pointsBalance diperbarui)

## 7.8 Misi Ekologi — `/misi`
- Tab: Harian / Mingguan / Bulanan
- Urutan render: `in_progress` → `completed` (siap klaim, beri highlight border `primary-500` + badge "Siap Diklaim!") → `claimed` (opacity 60%, di paling bawah)
- Klik "Klaim" pada mission card status `completed` → animasi singkat (scale bounce) → toast "+{xp} XP & +{poin} Poin!" → jika level naik, tampilkan `<Modal>` khusus "Level Up!" dengan `<EcoMascot>` animasi evolusi + confetti + tombol "Yeay!"
- Empty state per tab: "Belum ada misi {harian/mingguan/bulanan} saat ini. Cek lagi nanti ya!"

## 7.9 Leaderboard — `/leaderboard`
- Segmented control atas: "Kota Saya" / "Global"
- Podium 3 besar (rank 2 kiri lebih pendek, rank 1 tengah paling tinggi dengan mahkota ikon `accent-400`, rank 3 kanan) — tampilkan avatar, nama, XP
- List `<LeaderboardRow>` rank 4 dst
- Posisi user sendiri: jika di luar top 20 yang ditampilkan, tampilkan sebagai row sticky di bawah layar dengan style highlight (`bg-primary-50`, border `primary-500`)
- Empty state (kota belum ada partisipan lain): "Belum ada Pahlawan Hijau di kotamu. Jadilah yang pertama!"

## 7.10 Green Impact — `/dampak-hijau`
- `<StatWidget>` besar di atas: "Total CO2 Terselamatkan" — `{co2} kg` (`text-display`)
- Line chart Recharts: tren CO2 saved, toggle "Mingguan" / "Bulanan"
- `<Card variant="soft">` Eco-Widget Pohon:
  - Ilustrasi pohon (jumlah pohon sesuai perhitungan, max render 5 ikon pohon + teks "+{sisa} lagi" jika lebih)
  - Teks: "Setara menanam **{jumlah}** pohon dewasa!"
  - `<ProgressBar>` kecil: progress ke pohon digital berikutnya
  - `text-caption` disclaimer sumber data (dari Bagian 3.3)
- `<Button variant="secondary" fullWidth>` "Bagikan ke Media Sosial" → buka preview Share Card

**Data interface:**
```ts
interface GreenImpactData {
  co2SavedTotal: number;      // harus sama dengan DashboardData.co2SavedTotal
  co2Trend: { period: string; co2Kg: number }[]; // mingguan atau bulanan
  treeEquivalence: number;    // = co2SavedTotal ÷ 21 (lihat Bagian 3.3)
  treeProgressToNext: number; // 0-100, progress ke pohon digital berikutnya
  user: { name: string; level: 'bronze' | 'silver' | 'gold'; mascotStage: 1|2|3|4 };
}
```

**Loading state:** skeleton untuk StatWidget CO2 besar, skeleton line chart, skeleton Eco-Widget pohon.
**Empty state:** jika `co2SavedTotal === 0` → tampilkan: "Belum ada CO2 terselamatkan. Yuk mulai setor sampah!" + tombol "Setor Sampah" (navigasi ke `/input-sampah`). Chart & eco-widget tetap tampil dengan nilai 0.
**Error state:** full page error (ilustrasi + "Gagal memuat data" + tombol "Coba Lagi") — konsisten dengan Bagian 13.

**Social Share Card (Modal full screen preview, rasio 9:16):**
- Background gradient `secondary-500` → `secondary-700`
- Avatar & nama user
- `<EcoMascot>` sesuai level (`mascotStage` dari data)
- Angka besar: "{co2} kg CO2 Terselamatkan"
- "Setara {jumlah} Pohon Ditanam"
- Logo BuangYuk kecil di bawah + tagline
- Tombol "Unduh Gambar" (pakai html-to-image) dan "Bagikan" (Web Share API kalau didukung browser)
- Jika menu "Bagikan" tidak didukung browser, tombol "Bagikan" menyembunyikan diri dan hanya "Unduh Gambar" yang tampil (lihat Bagian 13, graceful degradation)

## 7.11 Peta Bank Sampah — `/bank-sampah`
- Map view (react-leaflet) dengan custom marker
- Search/filter jarak: "Terdekat", radius chip (1km/5km/10km)
- List di bawah map: nama bank sampah, jarak (`{jarak} km`), jam operasional, tombol "Lihat di Peta" (center map ke marker terkait) & "Rute" (buka Google Maps eksternal — link biasa, bukan integrasi penuh)
- Klik marker → bottom sheet info singkat lokasi

## 7.12 Edukasi/Tips — `/edukasi`
- List card artikel: gambar thumbnail 16:9, judul, ringkasan 1 baris, kategori chip ("Tips Pemilahan", "Fakta Daur Ulang", "Dampak Lingkungan")
- Detail artikel `/edukasi/:id`: gambar header, judul `text-h1`, konten dengan heading/paragraf, tombol share

## 7.13 Profil — `/profil`
- Header: avatar besar (dengan tombol edit kecil di pojok), nama, `<LevelBadge size="lg">` dengan progress XP
- Menu list (tiap item: ikon + label + chevron kanan):
  - Edit Profile → `/profil/edit`
  - Bahasa → `/profil/bahasa`
  - Lokasi → `/profil/lokasi`
  - **Level Ekologi** → `/profil/level`
  - **Galeri Pencapaian** → `/profil/badge`
  - Pengaturan Akun → `/profil/pengaturan`
  - Informasi → `/profil/informasi`
  - Keamanan & Privasi → `/profil/keamanan`
  - Tambahkan Akun → (aksi khusus, bukan navigasi halaman)
  - Keluar Akun → trigger `<Modal>` konfirmasi (lihat Bagian 5)

**Level Ekologi — `/profil/level`**
- `<EcoMascot size="lg">` sesuai stage — stage diturunkan dari level (lihat mapping Bagian 6.17)
- `<ProgressBar>` besar dengan label XP eksak
- Tabel 3 level (Bronze/Silver/Gold) dengan rentang XP dan deskripsi, level aktif di-highlight (lihat Bagian 14.1)

**Galeri Pencapaian — `/profil/badge`**
- Grid `<BadgeIcon>` 2 kolom mobile / 4 kolom desktop, urut: unlocked dulu lalu locked
- Klik badge → `<Modal>` detail: nama, ilustrasi besar, deskripsi syarat, tanggal unlock (jika unlocked) atau progress menuju syarat (jika locked & progress tersedia)
- **Loading state:** skeleton grid `<BadgeIcon>` (8 buah).
- **Empty state:** jika belum ada badge sama sekali (belum pernah setor) → `<EmptyState>` "Belum ada pencapaian. Yuk mulai setor sampah pertama!" + tombol "Setor Sampah". Murid pertama yang membuka galeri dengan 0 unlock melihat pesan ini.
- **Badge unlock baru:** saat pertama kali badge tampil & belum pernah dilihat, beri highlight ring pulse 2× lalu berhenti (Bagian 8) — misalnya setelah klaim misi atau setoran baru.
- Semua syarat badge & progress diambil dari data mock `badgesMock.ts`, konsisten dengan Bagian 14.7.

## 7.14 Notifikasi — `/notifikasi`
- Grouped list by waktu: "Hari Ini", "Minggu Ini", "Lebih Lama"
- `<NotificationItem>` per baris
- Tombol atas kanan: "Tandai Semua Dibaca"
- Empty state: "Belum ada notifikasi baru"

---

# 8. Micro-interactions & Animasi

| Elemen | Trigger | Animasi |
|---|---|---|
| Button primary | Klik | Scale 0.97 selama 100ms (tactile feedback) |
| Mascot evolusi | Level up | Scale bounce + confetti particle (Framer Motion `AnimatePresence`) |
| Progress bar | Mount / update value | Width transisi 600ms ease-out dari nilai lama ke baru |
| Toast | Muncul/hilang | Slide-up + fade, auto-dismiss 3 detik dengan progress bar tipis di bawah toast |
| Card list item (riwayat, notifikasi) | Mount | Stagger fade-in 50ms delay per item (maksimal untuk 10 item pertama, sisanya langsung tampil tanpa delay supaya tidak lambat) |
| Bottom sheet modal | Buka/tutup | Slide dari bawah 300ms ease-out |
| Skeleton loading | Selama loading | Shimmer pulse looping |
| Badge unlock baru | Pertama kali dilihat di galeri | Highlight ring pulse 2x lalu berhenti |

---

# 9. Struktur Folder & Konvensi Kode

```
/src
  /assets
    /illustrations   (empty states, onboarding)
    /badges          (8+ badge, versi unlocked & locked)
    /mascot          (4 stage SVG)
    /icons           (kategori sampah, map pin custom)
  /components
    /ui              (Button, Card, ProgressBar, BadgeIcon, StatWidget,
                       EmptyState, LoadingSkeleton, Toast, Modal, StepIndicator)
    /layout          (BottomNavBar, SidebarNav, TopAppBar)
    /feature         (MissionCard, ProductCard, LeaderboardRow, NotificationItem,
                       EcoMascot, LevelBadge, WasteCategoryPicker, ShareCard)
  /pages
    /auth            (Login.tsx, Register.tsx, OtpVerify.tsx)
    /dashboard        (Dashboard.tsx)
    /input-sampah     (Step1Category.tsx ... atau 1 file dengan internal step state)
    /riwayat          (RiwayatList.tsx, RiwayatDetail.tsx)
    /tukar-poin       (ProductList.tsx, ProductDetail.tsx)
    /misi             (MisiList.tsx)
    /leaderboard      (Leaderboard.tsx)
    /dampak-hijau     (GreenImpact.tsx, ShareCardPreview.tsx)
    /bank-sampah      (MapView.tsx)
    /edukasi          (ArticleList.tsx, ArticleDetail.tsx)
    /profil           (Profile.tsx, EditProfile.tsx, LevelDetail.tsx, BadgeGallery.tsx, dst)
    /notifikasi       (NotificationList.tsx)
  /mocks
    dashboardMock.ts
    greenImpactMock.ts   (lihat Bagian 14.8 — wajib sinkron dengan dashboardMock)
    missionsMock.ts
    productsMock.ts
    leaderboardMock.ts
    badgesMock.ts
    notificationsMock.ts
    wasteCategoriesMock.ts
    bankSampahMock.ts
    articlesMock.ts
  /types
    index.ts          (semua interface data dikumpulkan/di-export dari sini)
  /hooks
    useMockFetch.ts    (helper generik: simulasi delay + kadang random error untuk testing empty/error state)
  /styles
    index.css
  App.tsx              (routing)
  main.tsx
```

**Konvensi penamaan:** PascalCase untuk komponen (`MissionCard.tsx`), camelCase untuk file mock/hook/util. Tiap komponen 1 file, tidak digabung.

**Helper mock wajib dibuat (`useMockFetch.ts`):**
```ts
// Simulasi network delay + kemungkinan error, supaya loading/error state
// beneran bisa di-test, bukan cuma dummy statis yang selalu sukses instan
function useMockFetch<T>(mockData: T, options?: { delayMs?: number; errorRate?: number }) {
  // return { data, isLoading, error, refetch }
}
```

---

# 10. Aset Visual — Spesifikasi Produksi

| Aset | Format | Dimensi | Detail |
|---|---|---|---|
| Eco-Mascot Stage 1 (Benih) | SVG | 200×200px viewbox | Warna dominan primary-500, ekspresi lucu/imut |
| Eco-Mascot Stage 2 (Tunas) | SVG | 200×200px | Tambah elemen daun kecil |
| Eco-Mascot Stage 3 (Pohon Rindang) | SVG | 200×200px | Lebih besar, warna lebih matang, mungkin ada buah/bunga kecil |
| Eco-Mascot Stage 4 (Earth Guardian) | SVG | 200×200px | Elemen "penjaga" — mahkota daun, aura/glow, kesan heroik |
| Badge (8 buah minimal) | SVG, 2 versi (color + grayscale) | 96×96px | Nama: Plastic Slayer, Carbon Hero, Paper Saver, Glass Guardian, First Deposit, Streak Warrior, Community Hero, Top Contributor |
| Ikon Kategori Sampah | SVG | 48×48px | Kertas, Plastik, Kaca/Botol, Logam/Kaleng, Elektronik |
| Map Pin Custom | SVG | 32×40px (bentuk pin dengan ekor bawah) | Warna secondary-500, ikon tempat sampah di dalam |
| Ilustrasi Empty State (4 varian) | SVG | 240×240px | Gaya flat/friendly, warna sesuai palet |
| Ilustrasi Onboarding (3 slide) | SVG | 320×320px | Slide 1: setor sampah, Slide 2: dapat cuan+poin, Slide 3: dampak hijau tercipta |
| Logo BuangYuk | SVG (2 versi: full color + monokrom putih) | scalable | Untuk splash screen, share card, header |

Semua SVG disimpan sebagai React component via `vite-plugin-svgr` (`import { ReactComponent as MascotStage1 } from './mascot-stage-1.svg'`) supaya warna bisa dikontrol lewat `currentColor` di beberapa elemen jika dibutuhkan (misalnya badge grayscale bisa pakai CSS filter daripada file terpisah, tapi tetap sediakan file terpisah untuk fallback).

---

# 11. Accessibility Checklist

- [ ] Semua ikon interaktif (tombol icon-only) punya `aria-label`
- [ ] Kontras teks minimal AA (lihat tabel 4.2), terutama jangan pakai `primary-500` untuk teks kecil
- [ ] Semua form input punya `<label>` yang terasosiasi (bukan cuma placeholder)
- [ ] Focus state terlihat jelas (`focus:ring-2 focus:ring-primary-300`) di semua elemen interaktif, untuk pengguna keyboard
- [ ] Alt text pada semua gambar produk/artikel (dari data mock, field `altText`)
- [ ] Ukuran target sentuh (tap target) minimal 44×44px untuk tombol di mobile
- [ ] Tidak ada informasi yang HANYA disampaikan lewat warna (contoh: status setoran pakai warna + teks label, bukan warna saja)

---

# 12. Responsive Behavior per Breakpoint

| Halaman | Mobile | Tablet (md:) | Desktop (lg:) |
|---|---|---|---|
| Dashboard | 1 kolom, stack vertikal | Grid stat widget 2x2 tetap, chart lebih lebar | Layout 2 kolom: kiri (mascot+stat), kanan (chart+misi) |
| Tukar Poin | Grid produk 2 kolom | Grid 3 kolom | Grid 4 kolom, max-width container |
| Galeri Badge | Grid 2 kolom | Grid 3 kolom | Grid 4 kolom |
| Leaderboard | Podium stack, list full width | Podium lebih lebar | Podium + list side-by-side dengan panel info user di kanan |
| Navigasi | Bottom Nav Bar fixed | Bottom Nav Bar tetap | Sidebar Nav kiri, konten geser ke kanan |
| Input Sampah (form) | Full width, 1 step per layar | Sama, sedikit lebih lebar dengan max-width 480px di tengah | Sama seperti tablet, form tetap terpusat (tidak melebar penuh) |

---

# 13. Error Handling & Edge Case UI

| Skenario | Penanganan UI |
|---|---|
| Network gagal saat load Dashboard | Full page error state: ilustrasi + "Gagal memuat data" + tombol "Coba Lagi" |
| Network gagal saat load list (misi/riwayat/dll) | Error state HANYA di section itu, bukan seluruh halaman jika bagian lain sudah berhasil load |
| Submit form Input Sampah gagal | Toast error "Gagal mengirim setoran. Coba lagi." — data form TIDAK hilang, user tetap di step 5 |
| Foto profil gagal upload | Toast error + avatar tetap yang lama |
| Sesi/token invalid (401 dari mock) | Redirect otomatis ke `/login` dengan toast "Sesi kamu berakhir, silakan masuk kembali" |
| Input berat sampah di luar batas (>20kg atau <0.1kg) | Validasi inline, tombol "Lanjut" disabled, teks error di bawah input |
| Klaim misi yang sudah diklaim sebelumnya (race condition) | Tombol otomatis berubah jadi disabled + label "Sudah Diklaim" tanpa perlu reload manual |
| Koneksi lambat (>3 detik loading) | Skeleton tetap tampil, tambahkan teks kecil di bawah skeleton setelah 3 detik: "Masih memuat..." |

---

# 14. Data Dummy Final (Konsisten & Terverifikasi)

Gunakan angka ini di semua file mock — supaya semua halaman sinkron satu sama lain (misal: total CO2 di Dashboard harus sama dengan yang di Green Impact).

### 14.1 Level & XP
| Level | Rentang XP | Eco-Mascot Stage |
|---|---|---|
| Bronze Recycler | 0 – 500 | Stage 1 (Benih: 0–250) → Stage 2 (Tunas: 251–500) |
| Silver Eco-Warrior | 501 – 2.000 | Stage 3 (Pohon Rindang) |
| Gold Earth Guardian | 2.001+ | Stage 4 (Earth Guardian) |

> Level & stage mascot adalah **satu sistem** (lampiran visual dari level). Stage mascot berubah tepat saat XP melewati ambang di atas; setiap perubahan stage memicu Modal "Level Up!" + confetti (Bagian 8). Mapping ini konsisten dengan Bagian 6.16 & 6.17.

### 14.2 Reward Transaksi (per kg, berdasarkan kategori)
| Kategori | Harga/kg | XP/kg | Poin/kg | CO2 Saved/kg (estimasi, lihat Bagian 3.2) |
|---|---|---|---|---|
| Plastik | Rp2.500 | 50 | 250 | 1,5 kg |
| Kertas/Karton | Rp2.000 | 40 | 200 | 2,0 kg |
| Logam/Kaleng | Rp4.000 | 80 | 400 | 4,0 kg |
| Kaca | Rp1.500 | 30 | 150 | 0,3 kg |

### 14.3 Contoh Misi
| Tingkat | Judul | Target | Reward |
|---|---|---|---|
| Harian | "Setor Botol Plastik" | 0,5 kg plastik | +25 XP, 125 Poin |
| Mingguan | "Rajin Memilah" | 3 kg plastik/kertas | +150 XP, 500 Poin |
| Bulanan | "Pahlawan Daur Ulang" | 10 kg total sampah | +500 XP, 2.000 Poin |

### 14.4 Pie Chart Statistik Sampah (Default, sumber SIPSN — lihat Bagian 3.1)
Organik 39,4% / Plastik 19,6% / Kayu 12,6% / Kertas 11,2% / Lainnya 17,2%

### 14.5 Eco-Widget Pohon
Rumus: `Total CO2 Saved ÷ 21 = Jumlah Pohon Digital` (lihat Bagian 3.3 untuk sumber & disclaimer)

### 14.6 Contoh Produk E-Commerce
| Produk | Harga Rp | Harga Poin | Seller |
|---|---|---|---|
| Tas Belanja Daur Ulang Plastik | Rp35.000 | 3.500 Poin | UMKM Kreasi Hijau |
| Pot Bunga dari Botol Bekas | Rp15.000 | 1.500 Poin | SMK Karya Mandiri |
| Notebook Kertas Daur Ulang | Rp20.000 | 2.000 Poin | UMKM Daur Kertas |
| Tempat Pensil Kaleng Bekas | Rp18.000 | 1.800 Poin | SMK Karya Mandiri |

### 14.7 Contoh Badge & Syarat
| Badge | Syarat |
|---|---|
| First Deposit | Setor sampah pertama kali |
| Plastic Slayer | Total setor plastik ≥ 10 kg |
| Carbon Hero | Total CO2 saved ≥ 50 kg |
| Paper Saver | Total setor kertas ≥ 10 kg |
| Glass Guardian | Total setor kaca ≥ 5 kg |
| Streak Warrior | Setor sampah 4 minggu berturut-turut |
| Community Hero | Masuk top 10 leaderboard kota |
| Top Contributor | Masuk top 3 leaderboard global |

### 14.8 Isi Mock Gamifikasi (WAJIB Sinkron Lintas Halaman)

> Aturan emas: **semua mock gamifikasi dibangun dari satu sumber angka yang sama.** Jika sebuah nilai muncul di 2+ halaman, ia harus identik. Tim Arts memegang kebenaran angka ini di Bagian 3 & 14; tim Tech cukup mengganti isi file mock tanpa mengubah antarmuka komponen.

**Contoh `greenImpactMock.ts`** (nilai contoh, konsisten dengan Dashboard & 14.5):
```ts
export const greenImpactMock: GreenImpactData = {
  co2SavedTotal: 63,          // SAMA dengan DashboardData.co2SavedTotal
  co2Trend: [
    { period: "Minggu 1", co2Kg: 8 },
    { period: "Minggu 2", co2Kg: 12 },
    { period: "Minggu 3", co2Kg: 15 },
    { period: "Minggu 4", co2Kg: 28 },
  ],
  treeEquivalence: 3,         // 63 ÷ 21 = 3 (lihat 14.5)
  treeProgressToNext: 0,      // progress ke pohon berikutnya = (63 mod 21)/21 = 0/21 = 0%
  user: { name: "Rina", level: "silver", mascotStage: 3 },
};
```

**Contoh `badgesMock.ts`** (8 badge, urut unlocked dulu lalu locked, syarat konsisten dengan 14.7):
```ts
export const badgesMock: BadgeData[] = [
  // — unlocked —
  {
    id: "first-deposit", name: "First Deposit", unlocked: true,
    unlockedAt: "2025-01-12",
    requirement: "Setor sampah pertama kali",
    iconSrc: "/assets/badges/first-deposit.svg",
  },
  {
    id: "plastic-slayer", name: "Plastic Slayer", unlocked: true,
    unlockedAt: "2025-02-03",
    requirement: "Total setor plastik ≥ 10 kg", progress: 1, // 100%
    iconSrc: "/assets/badges/plastic-slayer.svg",
  },
  {
    id: "carbon-hero", name: "Carbon Hero", unlocked: true,
    unlockedAt: "2025-02-10",
    requirement: "Total CO2 saved ≥ 50 kg", progress: 1, // 63 kg ≥ 50 kg → sudah unlock
    iconSrc: "/assets/badges/carbon-hero.svg",
  },
  // — locked (dengan progress menuju syarat) —
  {
    id: "paper-saver", name: "Paper Saver", unlocked: false,
    unlockedAt: null,
    requirement: "Total setor kertas ≥ 10 kg", progress: 0.4, // 4 kg dicapai
    iconSrc: "/assets/badges/paper-saver.svg",
  },
  {
    id: "glass-guardian", name: "Glass Guardian", unlocked: false,
    unlockedAt: null,
    requirement: "Total setor kaca ≥ 5 kg", progress: 0,
    iconSrc: "/assets/badges/glass-guardian.svg",
  },
  {
    id: "streak-warrior", name: "Streak Warrior", unlocked: false,
    unlockedAt: null,
    requirement: "Setor sampah 4 minggu berturut-turut", progress: 0.5, // 2 minggu
    iconSrc: "/assets/badges/streak-warrior.svg",
  },
  {
    id: "community-hero", name: "Community Hero", unlocked: false,
    unlockedAt: null,
    requirement: "Masuk top 10 leaderboard kota", progress: 0,
    iconSrc: "/assets/badges/community-hero.svg",
  },
  {
    id: "top-contributor", name: "Top Contributor", unlocked: false,
    unlockedAt: null,
    requirement: "Masuk top 3 leaderboard global", progress: 0,
    iconSrc: "/assets/badges/top-contributor.svg",
  },
];
```

**Catatan progres badge:** field `progress` bernilai 0–1 (`currentAchieved / requirementTarget`, lebih dari 1 di-*clamp* ke 1 untuk kartu "unlocked"), dipakai di `<Modal>` detail badge untuk menampilkan baris progress. Nilai contoh di atas konsisten dengan `co2SavedTotal: 63` dan total setoran mock lain.

### 14.9 Prinsip Anti-Inflasi Level (Catatan QA untuk tim Tech)

Reward setoran (14.2: mis. plastik 50 XP/kg) terlalu murah dibanding ambang level (14.1: Gold = 2.001+ XP). Pastikan dengan simpel: **Gold tidak boleh tercapai terlalu cepat** sehingga level & badge kehilangan makna. Validasi cepat tim Tech: `(XP yang dibutuhkan ke Gold) ÷ (XP/kg rata-rata) ≈ jumlah kg setoran realistis per user aktif`. Jika hasilnya terlalu rendah (mis. < 30 kg), naikkan rentang XP atau turunkan XP/kg. Ini bagian dari Definition of Done QA (Bagian 15).

---

# 15. QA Checklist & Definition of Done

**Per halaman:**
- [ ] Layout benar di 3 breakpoint (mobile/tablet/desktop)
- [ ] 4 state diimplementasi: loading, empty (jika relevan), error, success
- [ ] Semua copy text sesuai Bagian 5 (Bahasa Indonesia, bukan placeholder)
- [ ] Warna & tipografi 100% dari token Bagian 4, tidak ada hex/px baru
- [ ] Data dari props/mock dengan interface TypeScript, tidak hardcode di JSX
- [ ] Komponen reusable dipakai ulang (cek tidak ada duplikasi style/logic)
- [ ] Kontras warna teks dicek (Bagian 4.2)
- [ ] Tap target minimal 44px di elemen interaktif mobile
- [ ] Micro-interaction sesuai Bagian 8 sudah jalan (tidak wajib sempurna, tapi ada)

**Global:**
- [ ] Routing semua halaman berfungsi, tidak ada broken link
- [ ] Bottom Nav Bar/Sidebar highlight halaman aktif dengan benar
- [ ] Font Poppins & Inter ter-load dengan benar (cek fallback jika gagal load)
- [ ] Tidak ada console error/warning React di semua halaman utama
- [ ] **Sinkronisasi data gamifikasi:** `co2SavedTotal` di Dashboard = Green Impact = sumber penghitung badge Carbon Hero; saldo poin & XP konsisten lintas halaman (Bagian 14.8)

---

# 16. Di Luar Scope Arts (Diserahkan ke Tim Tech)

- Autentikasi asli (JWT/session/OAuth), validasi backend, hashing password
- Koneksi database & REST API/GraphQL sungguhan
- Perhitungan bisnis logic final di server (kalkulasi harga/CO2/XP/level — Arts hanya menampilkan hasil dari props/mock, formula final harus divalidasi ulang oleh Tech sebelum production)
- Payment gateway/integrasi e-wallet asli
- Real-time GPS tracking penjemputan sungguhan (Arts hanya sediakan UI status/timeline)
- Push notification asli (Arts hanya sediakan UI daftar notifikasi)
- Rate limiting, keamanan API, environment variable/secret management

---

# 17. Ringkasan Sumber Data (Referensi Cepat)

| Data | Sumber | Link |
|---|---|---|
| Komposisi sampah Indonesia | SIPSN, Kementerian Lingkungan Hidup dan Kehutanan (KLHK) | sipsn.menlhk.go.id |
| Faktor emisi CO2 daur ulang | EPA Waste Reduction Model (WARM) | epa.gov/warm |
| Ekuivalensi CO2 ke pohon | EPA GHG Equivalencies Calculator | epa.gov/energy/greenhouse-gas-equivalencies-calculator |

Semua angka di atas adalah **estimasi/pendekatan untuk kebutuhan simulasi & demo**, bukan pengukuran ilmiah presisi — ini sudah dijelaskan disclaimer-nya di Bagian 3 dan wajib ditampilkan juga di aplikasi (bukan cuma di dokumen ini), supaya transparan ke pengguna dan juri.