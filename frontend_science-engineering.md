# Frontend System Architecture & Technical Specification (Frontend Spec)
## Project: BuangYuk – Platform Pengolahan & Daur Ulang Sampah Terintegrasi
### Technology Stack: Next.js (App Router), Tailwind CSS, TypeScript, Firebase Web SDK

---

| Metadata Document | Detail |
| :--- | :--- |
| **Nama Dokumen** | Frontend System Architecture & UI/UX Specification |
| **Framework Main** | Next.js 14+ (App Router) |
| **Styling & Design System**| Tailwind CSS, Shadcn UI / Radix UI Primitives, Lucide Icons |
| **State & Real-time** | React Context / Hooks + Firebase Web SDK (`onSnapshot`) |
| **Versi Dokumen** | 1.0.0 |
| **Tanggal Terbit** | 2026-04-15 |
| **Target Audience** | Frontend Developer, UI/UX Designer, System Architect, QA Engineer |

---

## 1. Scope & Frontend Objectives

Dokumen ini mendefinisikan spesifikasi arsitektur frontend untuk aplikasi **BuangYuk**. Frontend bertindak sebagai antarmuka utama pengguna (Masyarakat/Rumah Tangga) dan petugas penimbang (Field Verifier) dalam melakukan transaksi daur ulang sampah, visualisasi dampak karbon, serta edukasi terpersonalisasi.

### Fokus Utama Frontend:
1. **Real-time Impact Updates:** Menggunakan listener Firestore Client untuk memperbarui statistik emisi karbon dan saldo secara langsung tanpa pemicu *manual refresh*.
2. **Interactive UI Gamification:** Menyajikan *Personal Carbon Tracker*, progress bar level ekologi, serta ekivalensi dampak visual yang interaktif.
3. **Mobile-First & PWA Readiness:** Desain responsif yang dioptimalkan untuk perangkat seluler pengguna dan petugas di lapangan.
4. **Seamless Form & Image Upload:** Formulir multi-step pencatatan sampah dengan kompresi gambar otomatis sebelum diunggah ke Firebase Storage.

---

## 2. Peta Jalan Folder & Arsitektur Direktori (Next.js App Router)

Struktur direktori mengadopsi pola modular berbasis App Router Next.js untuk memisahkan antarmuka publik, dashboard pengguna, dan portal verifikator:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (user)/
│   │   ├── dashboard/
│   │   ├── input-sampah/
│   │   ├── riwayat/
│   │   ├── carbon-tracker/
│   │   ├── edukasi/
│   │   └── profil/
│   ├── (verifier)/
│   │   ├── scan/
│   │   └── verifikasi/[transactionId]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # Atomic UI Components (Buttons, Inputs, Cards, Badges)
│   ├── dashboard/          # Specialized Dashboard Widgets (CarbonTracker, ImpactChart)
│   ├── forms/              # Multi-step Forms (WasteInputForm, VerificationForm)
│   └── navigation/         # BottomNav, Header, Sidebar
├── context/
│   ├── AuthContext.tsx     # Firebase Auth State Provider
│   └── EcoTrackerContext.ts# Shared Real-time Eco Summary State
├── hooks/
│   ├── useAuth.ts
│   ├── useRealtimeSummary.ts
│   └── useWasteCalculator.ts
├── lib/
│   ├── firebaseClient.ts   # Firebase Web SDK Initializer
│   ├── constants.ts        # Constant Values & Emission Factors Reference
│   └── utils.ts            # Helper Functions (Formatters, Classnames)
└── types/
    ├── user.ts
    ├── waste.ts
    └── transaction.ts
```

---

## 3. Design System & Style Guide

### 3.1 Color Palette (ESG & Sustainability Theme)
Penggunaan warna mencerminkan identitas lingkungan hidup yang modern, bersih, dan profesional:

| Usage | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | Emerald Green | `#059669` | Header, Utama, Tombol Aksi, Status Success |
| **Secondary Accent**| Leaf/Lime Green | `#10B981` | Progress Bar, Highlights, Badge Aktif |
| **Background Base** | Off-White Slate | `#F8FAFC` | Latar belakang halaman aplikasi |
| **Surface/Cards** | Pure White / Tint | `#FFFFFF` | Kontainer kartu, modal, dan formulir |
| **Warning/Points** | Amber Gold | `#D97706` | Poin reward, indikator estimasi/draft |
| **Text Primary** | Deep Charcoal | `#0F172A` | Judul, konten teks utama |
| **Text Muted** | Slate Grey | `#64748B` | Label sekunder, tanggal, keterangan |

### 3.2 Typography & Spacing
* **Font Family:** `Inter` / `Plus Jakarta Sans`
* **Heading Scale:** `h1` (24px, Bold), `h2` (20px, SemiBold), `h3` (16px, Medium)
* **Body Scale:** Regular (14px), Small/Label (12px)
* **Touch Targets:** Minimal 48px × 48px untuk area yang dapat diklik pada perangkat seluler.

---

## 4. Spesifikasi Halaman & Tampilan Utama

### 4.1 Halaman Dashboard Utama (`/dashboard`)
* **Header:** Menyapa pengguna, menampilkan avatar profil, dan penanda role.
* **Widget Carbon Tracker:** Kartu utama yang menampilkan total $	ext{CO}_2	ext{e}$ Saved ($	ext{kg}$) dan Total Eco-Points dengan indikator visual *real-time*.
* **Widget Quick Actions:** Akses cepat ke "Setor Sampah", "Cari Bank Sampah", dan "Tukar Poin".
* **Widget Ringkasan Dampak Visual:** Ilustrasi ekivalensi konkrit (misal: "Kontribusimu setara dengan menanam 3 Pohon").
* **Feed Recommendations:** Carousel rekomendasi *Personalized Eco-Tips*.

### 4.2 Halaman Form Input Sampah (`/input-sampah`)
* **Step 1 - Pemilihan Material:** Grid kartu kategori (Kertas, Plastik, Logam/Kaca, E-Waste Portabel, CPU, Layar, dll).
* **Step 2 - Input Kuantitas & Normalisasi:** Field kuantitas dengan tombol opsi unit (`kg` / `pcs`). Sistem secara otomatis menampilkan pratinjau *Standardized Weight* dalam kg.
* **Step 3 - Estimasi Dynamic Preview:**
  * Estimasi Pendapatan Cash ($	ext{Rp}$)
  * Estimasi Reduction Karbon ($	ext{kg CO}_2	ext{e}$)
  * Estimasi Poin Reward
  * Label Penanda: **"Estimasi Sementara (Draft)"**
* **Step 4 - Upload Bukti & Lokasi:** Widget kamera/upload foto dan pemilih metode penjemputan/pengantaran.

### 4.3 Halaman Personal Carbon Tracker (`/carbon-tracker`)
* **Chart Statistik:** Grafik lingkaran (Donut Chart) distribusi jenis sampah yang berhasil didaur ulang.
* **Grafik Tren Emisi:** Grafik garis bulanan akumulasi reduksi karbon.
* **Badge & Level Ekologi:** Grid pencapaian badge (misal: *Plastic Fighter*, *E-Waste Pioneer*) dengan indikator terkunci/terbuka.
* **Panel Transparansi Metodologi:** Accordion "Bagaimana Kami Menghitung Dampakmu?" yang memuat rumus dan acuan EPA WARM.

### 4.4 Halaman Portal Verifikasi (`/verifier/scan` & `/verifikasi/[id]`)
* **Tampilan Khusus Petugas Bank Sampah:**
  * Pemindai QR Code untuk membaca ID Transaksi pengguna.
  * Form verifikasi fisik: Input berat aktual timbangan ($	ext{kg}$), opsi mengubah kategori sampah jika input pengguna tidak sesuai.
  * Ringkasan selisih input pengguna vs hasil verifikasi lapangan.
  * Tombol Aksi Utama: **Approve & Confirm Verification**, **Adjust Data**, atau **Reject**.

---

## 5. Arsitektur Komponen Frontend (Component Hierarchy)

```
[Layout Utama]
 ├── Navbar / Header (Pengguna / Verifikator)
 ├── Dynamic Page Content
 │    ├── [Dashboard Component Group]
 │    │    ├── CarbonTrackerWidget (Client Real-time)
 │    │    ├── QuickActionGrid
 │    │    └── ImpactVisualCard
 │    ├── [WasteInput Component Group]
 │    │    ├── CategorySelectorGrid
 │    │    ├── QuantityInputWithUnitToggle
 │    │    ├── RealtimeEstimationCard
 │    │    └── PhotoUploaderWithCompression
 │    └── [Verification Component Group]
 │         ├── QRScannerCamera
 │         ├── ActualWeightInputForm
 │         └── AuditDiffComparisonTable
 └── BottomNavigation (Mobile View)
```

---

## 6. Manajemen State & Sinkronisasi Real-Time

### 6.1 Strategy State Management
1. **Global Auth State:** Dibungkus dalam `AuthContext` menggunakan Firebase `onAuthStateChanged`.
2. **Real-Time Eco Summary State:** Menggunakan kustom hook `useRealtimeSummary` yang mendengarkan dokumen `user_eco_summaries/{userId}` di Firestore menggunakan `onSnapshot`.
3. **Form State:** Menggunakan `React Hook Form` + `Zod Schema Validator` untuk penanganan formulir input sampah dan verifikasi yang responsif dan tervalidasi.

### 6.2 Alur Data Client-Side (Data Flow Sequence)
1. **User Action:** Pengguna mengisi formulir setoran dan menekan tombol *Submit*.
2. **Client-Side Validation:** Form memvalidasi berat $> 0$, format foto valid, dan kategori terjangkau.
3. **Optimistic UI / Draft Notification:** Tampilan memberikan umpan balik instan bahwa transaksi tersimpan dalam status `PENDING`.
4. **Real-time Trigger:** Ketika petugas memverifikasi transaksi via Portal Verifikator, dokumen Firestore terbarui. Listener Client di dashboard pengguna menerima *update payload* dan memperbarui angka $CO_2$ saved secara otomatis.

---

## 7. Strategi Optimasi Kinerja & UX

* **Client-Side Image Compression:** Gambar bukti setoran di-kompres di tingkat peramban sebelum dikirim ke Firebase Storage untuk menghemat kuota dan mempercepat proses penyerahan.
* **Dynamic Imports & Code Splitting:** Komponen berat seperti Chart visualisasi dan QR Scanner dimuat secara *lazy-loading*.
* **Accessibility (a11y):** Kontras warna memenuhi standar WCAG AA, dukungan navigasi keyboard, dan penanda ARIA pada komponen modal dan tab.
* **Offline Indicator:** Menampilkan pemberitahuan saat koneksi internet terputus agar pengguna tidak kehilangan data saat mengisi formulir setoran.

---