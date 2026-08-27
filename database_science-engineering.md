# Database & Infrastructure Architecture Specification (Database Spec)
## Project: BuangYuk – Platform Pengolahan & Daur Ulang Sampah Terintegrasi
### Technology Stack: Google Cloud / Firebase (Cloud Firestore NoSQL, Firebase Auth, Firebase Storage)

---

| Metadata Document | Detail |
| :--- | :--- |
| **Nama Dokumen** | Database Architecture, Schema & Infrastructure Specification |
| **Database Engine** | Cloud Firestore (Document-based NoSQL) |
| **Storage Engine** | Firebase Cloud Storage |
| **Authentication Service**| Firebase Authentication |
| **Versi Dokumen** | 1.0.0 |
| **Tanggal Terbit** | 2026-04-15 |
| **Target Audience** | Database Administrator, Backend Developer, DevOps / Cloud Engineer, Security Auditor |

---

## 1. Scope & Database Architecture Overview

Dokumen ini mendefinisikan arsitektur basis data NoSQL Cloud Firestore, struktur direktori Cloud Storage, strategi indeksasi, serta aturan keamanan (*Security Rules*) untuk platform **BuangYuk**. 

### Karakteristik Utama Arsitektur Firestore:
1. **Document-Based Data Model:** Menggunakan struktur *Collections* dan *Documents* yang fleksibel, cepat, serta terskala secara otomatis (*auto-scaling*).
2. **Denormalization for Real-Time Reads:** Pemisahan data transaksi historis dari data ringkasan agregasi (`user_eco_summaries`) agar pembacaan dashboard berjalan secara *instant* tanpa perlu menghitung ulang (*on-the-fly aggregation*).
3. **Atomic Writes & Multi-Document Transactions:** Menggunakan mekanisme ACID Transaction pada Firestore untuk pembaruan status transaksi dan penambahan poin/emisi secara simultan.
4. **Server-Side Enforcement:** Seluruh hak akses baca/tulis diatur secara deklaratif melalui Firestore Security Rules dan Firebase Storage Rules.

---

## 2. Struktur Koleksi Firestore (Database Schema Design)

Berikut adalah arsitektur koleksi utama pada Cloud Firestore:

```
Firestore Root
├── users/                       {userId}
├── user_eco_summaries/          {userId}
├── waste_categories/            {subCategoryId}
├── waste_transactions/          {transactionId}
├── eco_point_redemptions/       {redemptionId}
└── audit_logs/                  {logId}
```

---

### 2.1 Koleksi: `users`
Menyimpan profil dasar pengguna, peran dalam sistem, dan data registrasi.

* **Document ID:** `userId` (Diambil dari Firebase Auth UID)

| Field Name | Data Type | Requirement | Description |
| :--- | :--- | :--- | :--- |
| `uid` | String | Mandatory | Firebase Auth Unique ID |
| `email` | String | Mandatory | Alamat email terdaftar |
| `fullName` | String | Mandatory | Nama lengkap pengguna |
| `phoneNumber` | String | Optional | Nomor WhatsApp/HP aktif |
| `role` | String | Mandatory | Enum: `"USER"`, `"VERIFIER"`, `"ADMIN"` |
| `address` | Object | Optional | Detail lokasi (jalan, RT/RW, kota, koordinat) |
| `profilePhotoUrl` | String | Optional | URL foto profil dari Firebase Storage |
| `createdAt` | Timestamp | Mandatory | Server Timestamp saat registrasi |
| `updatedAt` | Timestamp | Mandatory | Server Timestamp saat pembaruan profil |

---

### 2.2 Koleksi: `user_eco_summaries`
Menyimpan agregasi total reduksi emisi karbon dan saldo reward pengguna. Dirancang untuk dibaca oleh *Personal Carbon Tracker Widget* secara real-time.

* **Document ID:** `userId` (1-to-1 relationship dengan koleksi `users`)

| Field Name | Data Type | Requirement | Description |
| :--- | :--- | :--- | :--- |
| `userId` | String | Mandatory | ID Pengguna |
| `totalVerifiedWeightKg` | Number (Float) | Mandatory | Akumulasi berat sampah terverifikasi ($	ext{kg}$) |
| `totalCo2eSavedKg` | Number (Float) | Mandatory | Akumulasi reduksi emisi terverifikasi ($	ext{kg CO}_2	ext{e}$) |
| `totalEcoPoints` | Number (Integer) | Mandatory | Saldo aktif Eco-Points pengguna |
| `totalCashEarned` | Number (Integer) | Mandatory | Akumulasi rupiah dari hasil penjualan sampah |
| `badgeLevel` | String | Mandatory | Level akreditasi (misal: `"Carbon Warrior"`) |
| `lastUpdated` | Timestamp | Mandatory | Server Timestamp update transaksi terakhir |

---

### 2.3 Koleksi: `waste_categories`
Master data kategori dan spesifikasi material sampah beserta faktor emisi acuan EPA WARM dan konversi satuan.

* **Document ID:** `subCategoryId` (misal: `paper_cardboard`, `e_waste_mobile`)

| Field Name | Data Type | Requirement | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Mandatory | Unique ID Sub-Kategori |
| `categoryGroup` | String | Mandatory | Kelompok Utama (misal: `"Kertas"`, `"E-Waste"`) |
| `materialName` | String | Mandatory | Nama material spesifik (misal: `"Kardus Gelombang"`) |
| `unitType` | String | Mandatory | Enum: `"kg"` atau `"pcs"` |
| `conversionFactorToKg` | Number (Float) | Mandatory | Pengali berat jika unit `"pcs"` (Default `1.0` untuk `kg`) |
| `emissionSavingFactor` | Number (Float) | Mandatory | Faktor reduksi emisi EPA WARM ($	ext{kg CO}_2	ext{e}/	ext{kg}$) |
| `basePricePerKg` | Number (Integer) | Mandatory | Harga beli dasar per kg ($	ext{Rp}$) |
| `hazardousFlag` | Boolean | Mandatory | Penanda sampah B3 / Berbahaya |
| `isActive` | Boolean | Mandatory | Status ketersediaan kategori |

---

### 2.4 Koleksi: `waste_transactions`
Menyimpan seluruh catatan transaksi pengajuan dan verifikasi daur ulang sampah.

* **Document ID:** Auto-generated Firestore Unique ID (`transactionId`)

| Field Name | Data Type | Requirement | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Mandatory | Unique Transaction ID |
| `userId` | String | Mandatory | ID Pengguna pemilik sampah |
| `status` | String | Mandatory | Enum: `"PENDING"`, `"VERIFIED"`, `"REJECTED"`, `"ADJUSTED"` |
| `categoryId` | String | Mandatory | Ref: Master Kategori |
| `subCategoryId` | String | Mandatory | Ref: Master Sub-Kategori |
| `inputQuantity` | Number (Float) | Mandatory | Jumlah kuantitas yang diinput pengguna |
| `inputUnit` | String | Mandatory | Enum: `"kg"` atau `"pcs"` |
| `estimatedCo2eSaved` | Number (Float) | Mandatory | Hasil estimasi awal emisi ($	ext{kg CO}_2	ext{e}$) |
| `photoProofUrl` | String | Mandatory | Path/URL foto bukti sampah |
| `pickupMethod` | String | Mandatory | Enum: `"DROP_OFF"`, `"PICK_UP"` |
| `verifiedWeightKg` | Number (Float) | Nullable | Hasil timbangan fisik petugas ($	ext{kg}$) |
| `verifiedCo2eSaved` | Number (Float) | Nullable | Hasil pasti reduksi emisi terverifikasi |
| `earnedCash` | Number (Integer) | Nullable | Nominal rupiah pasti yang diterima |
| `earnedEcoPoints` | Number (Integer) | Nullable | Jumlah poin pasti yang diterima |
| `verifierId` | String | Nullable | ID Petugas penimbang |
| `verifierNote` | String | Nullable | Catatan audit lapangan |
| `createdAt` | Timestamp | Mandatory | Server Timestamp pembuatan draf |
| `verifiedAt` | Timestamp | Nullable | Server Timestamp verifikasi fisik |

---

### 2.5 Koleksi: `eco_point_redemptions`
Menyimpan riwayat penukaran Eco-Points pengguna menjadi voucher, pulsa, atau e-wallet.

* **Document ID:** Auto-generated Unique ID (`redemptionId`)

| Field Name | Data Type | Requirement | Description |
| :--- | :--- | :--- | :--- |
| `userId` | String | Mandatory | ID Pengguna yang menukar poin |
| `rewardItemId` | String | Mandatory | ID Item Katalog Reward |
| `rewardName` | String | Mandatory | Nama reward (misal: `"Voucher E-Wallet Rp 25.000"`) |
| `pointsSpent` | Number (Integer) | Mandatory | Jumlah poin yang dipotong |
| `status` | String | Mandatory | Enum: `"PROCESSING"`, `"SUCCESS"`, `"FAILED"` |
| `redemptionCode` | String | Nullable | Kode voucher / Token transaksi |
| `createdAt` | Timestamp | Mandatory | Server Timestamp penukaran |

---

## 3. Strategi Indeksasi (Indexing Strategy)

Untuk mendukung pencarian cepat dan menghindari kuery Firestore yang memakan sumber daya besar (*unindexed query error*), dibuat indeks komposit berikut:

| Collection Name | Fields Indexed (Order) | Query Purpose |
| :--- | :--- | :--- |
| `waste_transactions` | `userId` (ASC), `createdAt` (DESC) | Menampilkan riwayat transaksi per pengguna diurutkan dari yang terbaru |
| `waste_transactions` | `status` (ASC), `createdAt` (ASC) | Antrean verifikasi petugas bank sampah (*First-In First-Out*) |
| `waste_transactions` | `status` (ASC), `userId` (ASC), `createdAt` (DESC) | Filter transaksi tertunda spesifik pengguna |
| `eco_point_redemptions` | `userId` (ASC), `createdAt` (DESC) | Riwayat penukaran voucher pengguna |

---

## 4. Keamanan Database & Matriks Akses (Firestore Security Rules)

Sistem menggunakan prinsip **Least Privilege Access**. Pengguna biasa tidak memiliki hak tulis langsung ke koleksi yang memuat saldo poin dan emisi.

### Matriks Otorisasi Koleksi

| Koleksi | Role: `USER` (Owner) | Role: `VERIFIER` | Role: `ADMIN` | Client Direct Write Allowed? |
| :--- | :--- | :--- | :--- | :--- |
| `users` | Read & Write (Self) | Read Only | Full Access | Yes (Hanya Profil Sendiri) |
| `user_eco_summaries` | Read Only (Self) | Read Only | Full Access | **NO** (Hanya Server/Admin SDK) |
| `waste_categories` | Read Only | Read Only | Full Access | **NO** (Hanya Admin) |
| `waste_transactions` | Read & Create (Draft) | Read & Update (Verify) | Full Access | **Conditional** (Hanya Draft `PENDING`) |
| `eco_point_redemptions` | Read Only (Self) | No Access | Full Access | **NO** (Hanya Server/Admin SDK) |
| `audit_logs` | No Access | No Access | Read Only | **NO** (System Internal) |

---

## 5. Arsitektur Storage (Firebase Cloud Storage Structure)

Semua media visual (foto bukti setoran sampah dan foto profil) disimpan pada Firebase Cloud Storage dengan konvensi penamaan terstruktur.

```
storage-root/
├── profiles/
│   └── {userId}/
│       └── avatar.jpg
└── transactions/
    └── {userId}/
        └── {transactionId}/
            └── waste_proof.jpg
```

### Aturan Keamanan Storage (Firebase Storage Rules Logic):
1. **Aturan Ukuran File:** Maksimal $5	ext{ MB}$ per unggahan file foto.
2. **Aturan Tipe Format:** Hanya mengizinkan mimetype `image/jpeg`, `image/png`, dan `image/webp`.
3. **Aturan Kepemilikan:** Pengguna hanya dapat mengunggah file ke direktori yang sesuai dengan `userId` milik mereka sendiri.

---

## 6. Strategi Backup, Retensi Data & Disaster Recovery

1. **Automated Scheduled Backup:**
   * Konfigurasi Google Cloud Scheduler untuk memicu ekspor otomatis (*Firestore Export*) seluruh koleksi ke **Google Cloud Storage Bucket** secara harian (pukul 02.00 WIB).
2. **Data Retention Policy:**
   * Transaksi aktif dan data emisi disimpan secara permanen untuk kebutuhan statistik audit ESG.
   * *Audit Logs* disimpan selama minimal 2 tahun sebelum diarsipkan ke *Coldline Storage*.
3. **Point-in-Time Recovery (PITR):**
   * Mengaktifkan fitur Firestore PITR untuk memungkinkan pemulihan data ke detik tertentu jika terjadi kesalahan operasional manusia atau kerusakan data.
