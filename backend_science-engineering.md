# Backend System Architecture & Server Specification (Backend Spec)
## Project: BuangYuk – Platform Pengolahan & Daur Ulang Sampah Terintegrasi
### Technology Stack: Next.js (App Router - Server Actions & Route Handlers), Firebase Admin SDK, Node.js Runtime, Zod Validator

---

| Metadata Document | Detail |
| :--- | :--- |
| **Nama Dokumen** | Backend System Architecture & Science Engine Specification |
| **Runtime & Framework** | Node.js / Next.js Server-Side (Server Actions & Route Handlers) |
| **Database & Auth SDK** | Firebase Admin SDK (Firestore, Auth, Storage) |
| **Validation & Schema** | Zod Schema Validation |
| **Versi Dokumen** | 1.0.0 |
| **Tanggal Terbit** | 2026-04-15 |
| **Target Audience** | Backend Developer, System Architect, Security Engineer, QA Tester |

---

## 1. Scope & Backend Objectives

Dokumen ini menjelaskan spesifikasi arsitektur backend, *Server Actions*, API *Route Handlers*, serta modul kalkulasi ilmiah emisi (*Science & Calculation Engine*) untuk aplikasi **BuangYuk**. Backend berfungsi sebagai pusat logika bisnis, validasi data, eksekusi transaksi atomik, dan perantara aman antara pengguna, verifikator lapangan, dan database Firestore melalui **Firebase Admin SDK**.

### Fokus Utama Backend:
1. **Science-Based Calculation Engine:** Mengeksekusi kalkulasi reduksi emisi $	ext{CO}_2	ext{e}$ terverifikasi berdasar faktor emisi EPA WARM.
2. **Data Integrity & Atomic Transactions:** Menggunakan Firestore Transactional Write untuk menjamin tidak terjadinya *race condition* saat pembaruan saldo poin dan statistik emisi.
3. **Role-Based Access Control (RBAC):** Otentikasi dan otorisasi berlapis untuk peran `USER` (Masyarakat), `VERIFIER` (Petugas Lapangan), dan `ADMIN` (Pengelola Bank Sampah).
4. **Zero Client-Side Trust:** Semua kalkulasi emisi, insentif finansial, dan reward poin dihitung secara eksklusif di server (*Server-Side Execution*).

---

## 2. Arsitektur Modul Server & Alur Sistem

Backend diorganisir dalam struktur modular berbasis layanan (*Service-Oriented Structure*) di dalam lingkungan server Next.js:

```
src/
├── app/
│   └── api/                        # RESTful Route Handlers (External Integrations / Webhooks)
│       ├── v1/
│       │   ├── categories/         # Fetching Master Waste Categories
│       │   ├── transactions/       # Transaction Query & Export
│       │   └── webhooks/           # Third-party Integrations (Payment / Notification)
│       └── health/                 # Health Check Endpoint
├── actions/                        # Next.js Server Actions (Internal Mutations)
│   ├── authActions.ts              # Session Verification & User Onboarding
│   ├── wasteActions.ts             # Submit Waste Draft & Cancel Transaction
│   ├── verifyActions.ts            # Verification Pipeline & Firestore Transaction
│   └── rewardActions.ts            # Eco-Points Redemption System
├── server/
│   ├── services/                   # Business & Calculation Services
│   │   ├── carbonCalculator.ts     # EPA WARM Conversion Engine Logic
│   │   ├── rewardEngine.ts         # Dual-Reward Cash & Points Business Rules
│   │   ├── transactionService.ts   # Firestore Atomic Transactions Management
│   │   └── notificationService.ts  # Push Notification Sender (FCM)
│   ├── validators/                 # Zod Validation Schemas
│   │   ├── wasteSchema.ts
│   │   ├── verificationSchema.ts
│   │   └── rewardSchema.ts
│   └── guards/                     # Authentication & Authorization Rules
│       ├── authGuard.ts            # Decodes & Verifies Firebase ID Token
│       └── roleGuard.ts            # RBAC Middleware Check
└── lib/
    └── firebaseAdmin.ts            # Firebase Admin SDK Singleton Instance
```

---

## 3. Spesifikasi Science & Calculation Engine

Modul kalkulasi berjalan sepenuhnya di server dan tidak dapat dimodifikasi dari sisi klien. Modul ini menerima input berat/jumlah dan menghasilkan data statistik terverifikasi.

### 3.1 Pipeline Kalkulasi (Calculation Pipeline Steps)
1. **Normalization Layer:** Mengubah satuan non-standar (`pcs`) menjadi Kilogram ($	ext{kg}$) menggunakan *Conversion Factor* resmi spesifik kategori.
2. **Emission Reduction Layer:** Mengalikan Berat Standar ($	ext{kg}$) dengan *Emission Saving Factor* ($	ext{kg CO}_2	ext{e} / 	ext{kg}$) dari acuan EPA WARM.
3. **Financial Reward Layer:** Mengalikan Berat Standar ($	ext{kg}$) dengan Harga Dasar Sampah per $	ext{kg}$.
4. **Gamification Incentive Layer:** Menghitung *Eco-Points* gabungan dari bobot fisik dan kontribusi reduksi karbon.

### 3.2 Spesifikasi Formula & Parameter

| Parameter | Nama Variabel | Definisi / Acuan |
| :--- | :--- | :--- |
| **Input Quantity** | $Q_{in}$ | Jumlah kuantitas yang diinput/ditimbang |
| **Unit Type** | $U$ | Opsi satuan: `kg` atau `pcs` |
| **Conversion Factor** | $CF$ | Faktor konversi `pcs` ke `kg` (default `1.0` untuk `kg`) |
| **Emission Factor** | $EF$ | Faktor reduksi emisi ($	ext{kg CO}_2	ext{e}/	ext{kg}$) acuan EPA WARM |
| **Base Price** | $P_{base}$ | Harga jual dasar sampah per $	ext{kg}$ ($	ext{Rp}$) |
| **Weight Rate** | $R_w$ | Pengali poin berdasarkan berat (default: 10 poin/$	ext{kg}$) |
| **Carbon Rate** | $R_c$ | Pengali poin berdasarkan emisi (default: 50 poin/$	ext{kg CO}_2	ext{e}$) |

#### Persamaan Matematika Sistem Backend:
* **Berat Standar ($	ext{kg}$):** 
  $$W_{std} =  egin{cases} Q_{in} 	imes CF & 	ext{jika } U = 	ext{'pcs'} \ Q_{in} & 	ext{jika } U = 	ext{'kg'} \end{cases}$$
* **Reduksi Emisi Karbon ($	ext{kg CO}_2	ext{e}$):**
  $$	ext{CO}_2	ext{e Saved} = W_{std} 	imes EF$$
* **Imbalan Tunai/Cash ($	ext{Rp}$):**
  $$	ext{Cash Reward} = \lfloor W_{std} 	imes P_{base} 
floor$$
* **Eco-Points Reward:**
  $$	ext{Eco-Points} = 	ext{round}\left( (W_{std} 	imes R_w) + (	ext{CO}_2	ext{e Saved} 	imes R_c) 
ight)$$

---

## 4. Spesifikasi Server Actions & Endpoint API

### 4.1 Server Action: `submitWasteDraft`
Dieksekusi saat pengguna mengirimkan laporan setoran sampah awal.

* **Caller Role:** `USER`
* **Input Schema (Payload):**
  * `categoryId`: string (ID Kategori Utama)
  * `subCategoryId`: string (ID Spesifikasi Material)
  * `quantity`: number (Positif, $>0$)
  * `unit`: string (`kg` atau `pcs`)
  * `photoStoragePath`: string (Path file foto di Firebase Storage)
  * `pickupMethod`: string (`DROP_OFF` atau `PICK_UP`)
* **Output Standard:**
  * `success`: boolean
  * `transactionId`: string (ID Dokumen Firestore yang dibuat)
  * `estimatedCo2eSaved`: number (Estimasi Awal)
  * `status`: `"PENDING"`
* **Validasi Server:** Memastikan pengguna aktif terverifikasi, file foto valid di Storage, dan kategori aktif.

### 4.2 Server Action: `verifyWasteTransaction`
Dieksekusi oleh petugas bank sampah saat sampah ditimbang secara fisik di lapangan.

* **Caller Role:** `VERIFIER` / `ADMIN`
* **Input Schema (Payload):**
  * `transactionId`: string (ID Transaksi PENDING)
  * `verifiedWeightKg`: number (Hasil timbangan fisik akurat)
  * `adjustedSubCategoryId`: string (Opsional: Jika jenis material tidak sesuai input pengguna)
  * `verifierNote`: string (Opsional: Catatan audit petugas)
* **Output Standard:**
  * `success`: boolean
  * `verifiedCo2eSaved`: number
  * `earnedCash`: number
  * `earnedEcoPoints`: number
  * `status`: `"VERIFIED"`
* **Sistem Eksekusi Server:** Berjalan di dalam **Firestore Atomic Transaction**.

---

## 5. Arsitektur Transaksi Atomik & Keamanan Database

Untuk mencegah ketidakcocokan data akibat pembaruan berulang (*race condition* / *concurrent requests*), backend menggunakan Firestore Transactional Writes.

```
[Start Firestore Transaction]
   │
   ├── 1. Read Document: waste_transactions/{txId}
   │      └── Verify status == "PENDING" (Prevent double verification)
   │
   ├── 2. Read Document: waste_categories/{subCategoryId}
   │      └── Retrieve Emission Factor (EF) & Base Price
   │
   ├── 3. Execute Calculation Engine Server-Side
   │      └── Calculate: Verified Weight, CO2e Saved, Cash, Eco-Points
   │
   ├── 4. Write Step A: Update waste_transactions/{txId}
   │      └── Set Status = "VERIFIED", Record Timestamp, Log Verifier ID
   │
   └── 5. Write Step B: Atomic Increment user_eco_summaries/{userId}
          ├── totalVerifiedWeightKg += Verified Weight
          ├── totalCo2eSavedKg += CO2e Saved
          └── totalEcoPoints += Eco-Points
   │
[Commit Transaction]
```

---

## 6. Otorisasi & Otoritas Keamanan Server (Security Architecture)

### 6.1 Authentication Middleware & Guard
1. **Token Extraction:** Backend mengekstrak Bearer Token dari Header HTTP atau `__session` cookie.
2. **Token Verification:** Menggunakan `firebaseAdmin.auth().verifyIdToken(token)` untuk memverifikasi autentisitas sesi secara kriptografis.
3. **Role Checks (RBAC):** Mengecek `customClaims` pada token atau dokumen `users/{userId}`:
   * **USER:** Hanya dapat membaca/menulis draf miliknya sendiri.
   * **VERIFIER:** Dapat memperbarui transaksi berstatus PENDING di area tugasnya.
   * **ADMIN:** Memiliki akses penuh ke seluruh audit trail dan pengelolaan kategori.

### 6.2 Schema Validation (Zod Validation Layer)
Setiap input dari klien dibersihkan dan divalidasi sebelum menyentuh lapisan logika bisnis:
* Mencegah *Injection Attacks* dan data malformed.
* Membatasi nilai kuantitas maksimum per setoran (misal: maksimum $500	ext{ kg}$ per transaksi untuk mencegah manipulasi angka).

---

## 7. Penanganan Error & Log Sistem

### 7.1 Format Respons Error Standar
Setiap kegagalan di tingkat backend mengembalikan objek error terstruktur:
* `code`: String Identifier (misal: `UNAUTHORIZED`, `INVALID_WEIGHT`, `TRANSACTION_ALREADY_VERIFIED`)
* `message`: Keterangan terbaca untuk pengguna/sistem.
* `timestamp`: ISO-8601 UTC Timestamp.

### 7.2 Audit Trail Logging
Setiap tindakan verifikasi dan perubahan data keuangan/poin dicatat dalam sub-koleksi `audit_logs` di Firestore yang memuat:
* ID Pelaku (*Operator ID*)
* Tindakan (*Action Type*)
* Data sebelum dan sesudah perubahan (*Delta Snapshot*)
* IP Address / User Agent Request

---