# 🌿 BuangYuk Database Architecture

## Overview

Database Firestore untuk platform BuangYuk menggunakan **Cloud Firestore NoSQL** dengan arsitektur:
- **Denormalization** untuk real-time reads
- **Atomic Transactions** untuk update status transaksi
- **Security Rules** dengan Least Privilege Access

---

## 📁 Collection Structure

```
Firestore Root
├── users/{userId}                          # Profil pengguna
├── user_eco_summaries/{userId}             # Agregasi eco-points & CO₂
├── waste_categories/{subCategoryId}        # Master data kategori sampah
├── waste_transactions/{transactionId}      # Transaksi setoran & verifikasi
├── eco_point_redemptions/{redemptionId}    # Riwayat penukaran poin
└── audit_logs/{logId}                      # Log audit sistem
```

---

## 📊 Collections Detail

### 1. `users`
| Field | Type | Description |
|-------|------|-------------|
| `uid` | String | Firebase Auth UID |
| `email` | String | Email terdaftar |
| `fullName` | String | Nama lengkap |
| `phoneNumber` | String | Nomor HP (optional) |
| `role` | String | `USER`, `VERIFIER`, `ADMIN` |
| `address` | Object | Detail lokasi |
| `profilePhotoUrl` | String | URL foto profil |
| `createdAt` | Timestamp | Waktu registrasi |
| `updatedAt` | Timestamp | Waktu update terakhir |

### 2. `user_eco_summaries`
| Field | Type | Description |
|-------|------|-------------|
| `userId` | String | ID pengguna |
| `totalVerifiedWeightKg` | Number | Total berat terverifikasi |
| `totalCo2eSavedKg` | Number | Total CO₂e terselamatkan |
| `totalEcoPoints` | Number | Saldo Eco-Points |
| `totalCashEarned` | Number | Total rupiah diterima |
| `badgeLevel` | String | Level ekologi |
| `lastUpdated` | Timestamp | Update terakhir |

### 3. `waste_categories`
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique ID kategori |
| `categoryGroup` | String | Kelompok utama |
| `materialName` | String | Nama material |
| `unitType` | String | `kg` atau `pcs` |
| `conversionFactorToKg` | Number | Faktor konversi ke kg |
| `emissionSavingFactor` | Number | Faktor emisi EPA WARM |
| `basePricePerKg` | Number | Harga dasar per kg (Rp) |
| `hazardousFlag` | Boolean | Sampah B3 |
| `isActive` | Boolean | Status aktif |

### 4. `waste_transactions`
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Transaction ID |
| `userId` | String | ID pengguna |
| `status` | String | `PENDING`, `VERIFIED`, `REJECTED`, `ADJUSTED` |
| `categoryId` | String | Ref kategori |
| `subCategoryId` | String | Ref sub-kategori |
| `inputQuantity` | Number | Kuantitas input |
| `inputUnit` | String | Satuan input |
| `estimatedCo2eSaved` | Number | Estimasi CO₂e |
| `photoProofUrl` | String | URL foto bukti |
| `pickupMethod` | String | `DROP_OFF` atau `PICK_UP` |
| `verifiedWeightKg` | Number | Berat verifikasi |
| `verifiedCo2eSaved` | Number | CO₂e terverifikasi |
| `earnedCash` | Number | Rupiah diterima |
| `earnedEcoPoints` | Number | Poin diterima |
| `verifierId` | String | ID petugas |
| `verifierNote` | String | Catatan verifikasi |
| `createdAt` | Timestamp | Waktu buat |
| `verifiedAt` | Timestamp | Waktu verifikasi |

### 5. `eco_point_redemptions`
| Field | Type | Description |
|-------|------|-------------|
| `userId` | String | ID pengguna |
| `rewardItemId` | String | ID item reward |
| `rewardName` | String | Nama reward |
| `pointsSpent` | Number | Poin dipotong |
| `status` | String | `PROCESSING`, `SUCCESS`, `FAILED` |
| `redemptionCode` | String | Kode voucher |
| `createdAt` | Timestamp | Waktu penukaran |

---

## 🔐 Security Rules

### Access Matrix
| Collection | USER | VERIFIER | ADMIN | Client Write |
|------------|------|----------|-------|--------------|
| `users` | Read/Write (Self) | Read Only | Full | Yes (Self) |
| `user_eco_summaries` | Read Only (Self) | Read Only | Full | **NO** |
| `waste_categories` | Read Only | Read Only | Full | **NO** |
| `waste_transactions` | Read/Create (Draft) | Read/Update | Full | Conditional |
| `eco_point_redemptions` | Read Only (Self) | No Access | Full | **NO** |
| `audit_logs` | No Access | No Access | Read Only | **NO** |

---

## 📦 Indexes

| Collection | Fields | Purpose |
|------------|--------|---------|
| `waste_transactions` | `userId` ASC, `createdAt` DESC | Riwayat transaksi pengguna |
| `waste_transactions` | `status` ASC, `createdAt` ASC | Antrean verifikasi |
| `waste_transactions` | `status` ASC, `userId` ASC, `createdAt` DESC | Filter transaksi per user |
| `eco_point_redemptions` | `userId` ASC, `createdAt` DESC | Riwayat penukaran |

---

## 🚀 Setup & Deployment

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project: `buang-yuk`

### 1. Login Firebase
```bash
firebase login
```

### 2. Initialize Firebase
```bash
firebase use buang-yuk
```

### 3. Install Scripts Dependencies
```bash
cd backend
npm install
```

### 4. Initialize Database
```bash
# From inside the backend/ folder
cd backend

# Seed waste categories only (via npm script)
npm run db:seed-categories

# Initialize DB (seed categories + optional admin)
npm run db:init

# Seed + create admin user
npm run db:init -- admin@yourdomain.com
```

### 5. Deploy Security Rules
```bash
# Deploy all
firebase deploy

# Or deploy individually
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

---

## 📁 Storage Structure

```
storage-root/
├── profiles/
│   └── {userId}/
│       └── avatar.jpg          # Maks 5MB, jpg/png/webp
└── transactions/
    └── {userId}/
        └── {transactionId}/
            └── waste_proof.jpg # Maks 5MB, jpg/png/webp
```

### Storage Rules Summary
- **Max file size:** 5MB
- **Allowed formats:** JPEG, PNG, WebP
- **Ownership:** Users can only upload to their own directory
- **Read:** Authenticated users can read profiles; owners + verifiers can read transaction photos

---

## 🔄 Backup & Recovery

1. **Automated Backup:** Daily export to Cloud Storage at 02:00 WIB
2. **Retention:** Transaction data permanent; Audit logs 2 years
3. **PITR:** Point-in-Time Recovery enabled for Firestore
