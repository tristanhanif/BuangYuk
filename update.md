# 🌿 BuangYuk — Product Requirements Document (PRD)

**Product:** BuangYuk
**Document Type:** Product Requirements Document
**Version:** 1.0
**Status:** FINAL — Requirement Gathering Complete
**Target MVP:** Prototype / Demo-Ready
**Initial Market:** Bandung
**Architecture:** Multi-region ready
**Primary Language:** Bahasa Indonesia
**Currency:** IDR
**Database:** Cloud Firestore
**Authentication:** Firebase Authentication
**Backend:** NestJS
**Frontend:** Next.js
**Maps:** Google Maps through abstraction layer
**Payment:** Midtrans Sandbox + Mock Fallback
**Notifications:** Firebase Cloud Messaging + In-App fallback

---

# 1. Product Overview

## 1.1 Product Description

**BuangYuk** adalah platform digital pengelolaan sampah yang menghubungkan:

* Customer
* Collector
* Bank Sampah
* UMKM
* Super Admin

dalam satu ekosistem circular economy.

Customer dapat mengajukan pickup sampah dari lokasi mereka. Sistem kemudian menggunakan **Weighted Scoring Engine** untuk memilih collector yang paling sesuai berdasarkan parameter yang telah dikonfigurasi.

Collector menerima request, menuju lokasi customer, melakukan verifikasi sampah, dan menyelesaikan pickup.

Sampah kemudian diarahkan ke Bank Sampah yang sesuai berdasarkan material, kapasitas, lokasi, dan konfigurasi operasional.

Customer mendapatkan:

* uang hasil sampah,
* Eco Points,
* informasi Estimated CO₂e Avoided,
* badge dan level.

BuangYuk juga menyediakan marketplace yang memungkinkan UMKM menjual produk kepada customer.

---

## 1.2 Product Principle

BuangYuk menggunakan prinsip:

> **"Semudah memesan layanan ride-hailing, tetapi untuk mengelola sampah."**

Customer tidak perlu menentukan collector secara manual.

Sistem menangani:

1. Request pickup
2. Matching
3. Acceptance
4. Tracking
5. Arrival detection
6. Waste verification
7. Customer confirmation
8. Settlement
9. Reward
10. Notification
11. Audit

---

# 2. Problem Statement

Pengelolaan sampah rumah tangga menghadapi beberapa masalah:

### Customer

* Tidak selalu mengetahui tempat menjual sampah.
* Harga sampah tidak transparan.
* Sulit mendapatkan layanan pickup yang praktis.
* Tidak mengetahui dampak ekologis dari sampah yang mereka kelola.
* Proses pencatatan transaksi masih dapat dilakukan secara manual.

### Collector

* Sulit mendapatkan pickup yang efisien.
* Tidak memiliki sistem dispatch terstruktur.
* Tidak memiliki tracking dan reliability scoring terpusat.

### Bank Sampah

* Sulit mengelola kapasitas.
* Data transaksi dapat tersebar.
* Kesulitan melakukan settlement.
* Tidak memiliki dashboard operasional terpadu.

### UMKM

* Membutuhkan kanal penjualan tambahan.
* Membutuhkan marketplace yang terintegrasi dengan ekosistem sustainability.

### Platform

Diperlukan sistem yang dapat menghubungkan seluruh pihak dengan workflow otomatis dan dapat diaudit.

---

# 3. Vision & Goals

## 3.1 Vision

Menjadi platform circular economy yang menghubungkan masyarakat, collector, Bank Sampah, dan UMKM dalam satu ekosistem digital yang praktis, transparan, dan scalable.

## 3.2 MVP Goals

MVP harus mampu mendemonstrasikan:

* 5-role end-to-end flow
* automated pickup dispatch
* Weighted Scoring Engine
* realtime collector tracking
* geofencing
* dynamic waste pricing
* waste verification
* wallet
* Eco Points
* marketplace
* Bank Sampah operations
* dispute handling
* fraud flagging
* audit logging
* carbon impact estimation
* payment sandbox/mock

---

# 4. Target Users

## 4.1 Primary

### Customer

Pengguna yang:

* memiliki sampah untuk dijual/disetorkan,
* membutuhkan pickup,
* ingin memperoleh uang dan Eco Points.

### Collector

Petugas yang mengambil sampah dari customer.

### Bank Sampah

Pihak yang menerima dan membeli material sampah.

### UMKM

Seller produk dalam marketplace BuangYuk.

### Super Admin

Administrator platform yang mengatur sistem, konfigurasi, transaksi, dispute, fraud, pricing, dan operational monitoring.

---

# 5. User Roles

BuangYuk memiliki 5 canonical roles:

| Role        | Fungsi                                                            |
| ----------- | ----------------------------------------------------------------- |
| CUSTOMER    | Mengajukan pickup, melihat transaksi, wallet, reward, marketplace |
| COLLECTOR   | Menerima pickup, tracking, verifikasi sampah                      |
| BANK_SAMPAH | Mengelola material, kapasitas, penerimaan dan settlement          |
| UMKM        | Menjual produk melalui marketplace                                |
| SUPER_ADMIN | Mengelola keseluruhan platform                                    |

Role legacy seperti `USER`, `VERIFIER`, dan `ADMIN` pada database architecture sebelumnya harus dimigrasikan ke canonical RBAC.

---

# 6. Business Model

BuangYuk menggunakan **Hybrid Business Model**:

1. Waste transaction spread
2. Marketplace commission
3. Bank Sampah SaaS
4. Eco reward ecosystem

---

## 6.1 Waste Transaction

Model utama:

```text
Customer Waste Value
        ↓
BuangYuk Acquisition Value
        ↓
Bank Sampah Purchase Value
```

Prototype:

```text
Gross Spread = 15%
```

**Status:** PROTOTYPE ASSUMPTION

15% tidak boleh dianggap sebagai harga atau margin nasional.

Seluruh parameter harus configurable.

---

## 6.2 Marketplace

Prototype:

```text
Marketplace Commission = 10% × Order Product Value
```

Seller menerima:

```text
Seller Revenue
= Order Product Value
- Marketplace Commission
```

Shipping fee dipisahkan dari marketplace commission.

**Status:** PROTOTYPE ASSUMPTION + CONFIGURABLE

---

## 6.3 Bank Sampah SaaS

### FREE / BASIC

* Profil Bank Sampah
* Material acceptance
* Basic transactions
* Basic dashboard

### PRO

* Advanced analytics
* Export reports
* Advanced operational management
* Higher transaction/data limits

### ENTERPRISE / PARTNER

* Advanced analytics
* Multi-location
* Custom reporting
* Dedicated support/integration

Harga subscription tidak dikunci pada MVP.

---

# 7. Value Proposition

## Customer

> "Jual atau setorkan sampah dengan mudah, dapatkan uang dan reward, serta lihat dampak lingkunganmu."

## Collector

> "Dapatkan pickup terdekat dengan sistem dispatch otomatis."

## Bank Sampah

> "Kelola material, transaksi, kapasitas, dan settlement secara digital."

## UMKM

> "Jual produk melalui marketplace yang terhubung dengan sustainability ecosystem."

## Super Admin

> "Mengelola seluruh ekosistem dengan konfigurasi, analytics, audit, dan kontrol operasional."

---

# 8. Product Scope

## In Scope — MVP

* Customer application
* Collector application
* Bank Sampah dashboard
* UMKM marketplace
* Super Admin dashboard
* Firebase Authentication
* Google OAuth
* Pickup lifecycle
* Weighted Scoring Engine
* Geofencing
* Realtime tracking
* Dynamic pricing
* Waste proof
* Waste verification
* Wallet
* Eco Points
* Collector earnings
* Bank Sampah settlement
* Marketplace
* FCM notifications
* Google Maps
* Carbon impact
* Gamification
* Dispute
* Rule-Based Fraud Detection
* Audit Log
* Midtrans Sandbox
* Mock payment fallback

---

# 9. MVP Scope

MVP harus mampu melakukan satu demonstrasi lengkap:

```text
Customer
   ↓
Create Pickup
   ↓
Proof of Waste
   ↓
Matching Engine
   ↓
Collector
   ↓
Accept
   ↓
Realtime Tracking
   ↓
Geofence
   ↓
Arrived
   ↓
Waste Verification
   ↓
Customer Confirmation
   ↓
Pricing
   ↓
Wallet / Eco Points
   ↓
Bank Sampah Settlement
   ↓
Audit Log
```

Marketplace dan admin workflow juga harus dapat didemonstrasikan secara terpisah dalam MVP.

---

# 10. Future Scope

Future Scope tidak dianggap tersedia pada MVP.

* AI/ML Image Recognition
* AI/ML Fraud Detection
* AI/ML Demand Prediction
* Adaptive GPS Tracking
* Full Offline-First / PWA
* Real SMS/WhatsApp OTP
* DANA/GoPay/OVO integration
* JNE/J&T/SiCepat integration
* Escrow
* Seasonal pricing
* Volume factor
* Leaderboard
* Chat
* Voice Note
* Video Proof
* Real Bank Sampah SaaS billing
* English
* Advanced Heatmap
* IoT Smart Scale
* Blockchain Traceability
* Native iOS/Android

---

# 11. User Journey

## 11.1 Customer Pickup

```text
Login
↓
Select Waste
↓
Enter Quantity
↓
Upload 2 Photos
↓
Select Pickup
↓
Review Estimate
↓
Create Pickup
↓
Matching
↓
Collector Assigned
↓
Collector Accepts
↓
Tracking
↓
Collector Arrives
↓
Verification
↓
Customer Confirms
↓
Final Price
↓
Wallet / Eco Points
↓
Completed
```

---

# 12. Detailed Functional Requirements

## FR-001 Authentication

Customer, Collector, Bank Sampah, UMKM, dan Super Admin harus memiliki authenticated identity.

Firebase Authentication digunakan sebagai authentication layer.

Google OAuth tersedia untuk customer authentication.

---

## FR-002 Customer Profile

Customer dapat:

* melihat profile,
* mengubah nama,
* nomor telepon,
* alamat,
* foto profile.

Sensitive system fields tidak dapat diubah client.

---

## FR-003 Create Waste Transaction

Customer dapat membuat draft:

* material,
* quantity,
* unit,
* pickup method,
* location,
* photos.

---

## FR-004 Proof of Waste

Customer wajib mengupload:

1. Overview photo
2. Detail photo

Client melakukan compression/resize sebelum upload.

---

## FR-005 Pickup

Customer dapat membuat pickup request berdasarkan lokasi.

System kemudian mencari collector yang eligible.

---

## FR-006 Matching

System menjalankan Weighted Scoring Engine.

Tidak menggunakan AI/ML.

---

## FR-007 Collector Acceptance

Collector memiliki waktu:

**60 detik**

untuk menerima pickup.

Jika timeout:

```text
Collector A
↓ timeout
Collector B
↓ timeout
Collector C
```

System melakukan auto-reassignment.

Timeout configurable.

---

## FR-008 Realtime Tracking

Collector location dikirim setiap:

**5 detik**

Data dikirim langsung ke Firestore.

Timestamp harus divalidasi.

---

## FR-009 Geofencing

System:

* `≤ 500m` → Near
* `≤ 100m` → Auto Arrived

Jika geolocation tidak dapat digunakan:

manual fallback tersedia.

---

## FR-010 Waste Verification

Collector memasukkan:

* verified weight,
* condition,
* material,
* notes,
* evidence jika diperlukan.

Customer melakukan konfirmasi 1-tap.

---

## FR-011 Weight Deviation

Jika:

```text
|Verified Weight - Estimated Weight|
----------------------------------- > 50%
Estimated Weight
```

maka customer wajib melakukan re-confirmation.

Threshold configurable.

---

# 13. Pickup Lifecycle / State Machine

Pickup menggunakan 8 state utama.

```text
REQUESTED
   ↓
MATCHING
   ↓
ASSIGNED
   ↓
ACCEPTED
   ↓
EN_ROUTE
   ↓
ARRIVED
   ↓
VERIFYING
   ↓
COMPLETED
```

Additional exception state dapat digunakan untuk:

* CANCELLED
* EXPIRED
* DISPUTED
* FAILED
* REASSIGNED

---

## 13.1 State Rules

### REQUESTED

Customer membuat request.

### MATCHING

System mencari collector.

### ASSIGNED

Collector telah dipilih.

### ACCEPTED

Collector menerima dalam 60 detik.

### EN_ROUTE

Collector menuju customer.

### ARRIVED

Geofence ≤100m atau manual fallback.

### VERIFYING

Collector memverifikasi waste.

### COMPLETED

Customer melakukan confirmation dan settlement berhasil.

---

## 13.2 Cancellation

Customer cancellation:

### Free

Jika collector belum OTW.

### Penalty

Jika collector sudah dalam perjalanan.

Penalty bersifat escalating dan configurable.

---

# 14. Smart Matching Engine

Nama resmi:

> **Weighted Scoring Engine**

Bukan AI.

## 14.1 Weight

| Factor                  | Weight |
| ----------------------- | -----: |
| Distance                |    25% |
| Reliability             |    25% |
| Availability            |    15% |
| Capacity                |    15% |
| Acceptance performance  |    10% |
| Other configured factor |    10% |

Total:

**100%**

---

## 14.2 Score

```text
Total Score =
(Distance × 25%)
+ (Reliability × 25%)
+ (Availability × 15%)
+ (Capacity × 15%)
+ (Acceptance × 10%)
+ (Other × 10%)
```

Weights configurable melalui Admin.

---

## 14.3 Eligibility

Collector harus:

* aktif,
* authenticated,
* available,
* berada dalam service region,
* tidak suspended,
* memenuhi operational criteria.

---

# 15. Dynamic Waste Pricing

Formula:

```text
Price =
Base Price
× Grade Factor
× Condition Factor
× Region Factor
```

Semua parameter configurable.

Harga sampah:

> **Bukan harga nasional.**

Harga bergantung pada:

* region,
* Bank Sampah,
* material,
* grade,
* condition,
* configuration.

---

## 15.1 Pricing Snapshot

Saat transaksi final:

```text
pricingSnapshot
```

harus disimpan.

Perubahan harga di masa depan tidak boleh mengubah transaksi lama.

---

# 16. Waste Verification

Collector melakukan:

1. pengecekan material,
2. pengecekan condition,
3. penimbangan,
4. input verified weight,
5. input notes,
6. submit verification.

Customer melihat:

* estimated quantity,
* verified quantity,
* price adjustment,
* final amount.

Customer dapat:

```text
CONFIRM
```

atau:

```text
DISPUTE
```

---

# 17. Wallet & Rewards

Wallet architecture:

## Balance Wallet

Digunakan untuk:

* cash balance,
* cashout,
* marketplace-related balance.

Minimum cashout:

**Rp10.000**

Cashout fee:

**Rp1.000**

Nilai tersebut merupakan configured prototype/business rule sesuai requirement final.

---

## Eco Points

Eco Points:

* tidak dianggap uang,
* hanya digunakan untuk voucher/reward,
* memiliki transaction history.

---

## 17.1 Wallet Transaction

Setiap perubahan balance harus menghasilkan immutable transaction record.

Contoh:

```text
CREDIT_WASTE
CASHOUT
MARKETPLACE_PAYMENT
REFUND
ADJUSTMENT
```

Client tidak boleh mengubah balance secara langsung.

---

# 18. Payment

Payment architecture:

```text
Payment Service
├── Midtrans Sandbox
└── Mock Payment Provider
```

Jika Midtrans Sandbox tidak tersedia untuk demo:

```text
Mock Payment
```

digunakan.

MVP tidak mengklaim production payment integration.

---

## Transaction PIN

Customer memiliki:

**6-digit Transaction PIN**

PIN tidak boleh disimpan plaintext.

Prototype dapat menggunakan Mock OTP.

---

# 19. Collector Earnings

Collector memperoleh:

```text
Base Fee
+
Commission
```

Commission bersifat configurable.

Status earnings:

```text
PENDING
↓
AVAILABLE
↓
WITHDRAWAL
```

Pending period:

**24 jam**

Setelah 24 jam, earnings menjadi available jika tidak ada blocking dispute/fraud.

---

# 20. Bank Sampah Operations & Settlement

Bank Sampah dapat mengatur:

* accepted materials,
* capacity,
* operating availability,
* purchase pricing,
* transaction records.

---

## 20.1 Capacity

Setiap Bank Sampah memiliki daily capacity.

Jika capacity penuh:

```text
Bank A → Full
Bank B → Candidate
```

System melakukan fallback partner selection.

Capacity auto-confirm period:

**24 jam**

---

## 20.2 Settlement

BuangYuk bertindak sebagai:

> **Platform Intermediary**

Model:

```text
Customer Waste Value
↓
BuangYuk Acquisition
↓
Bank Sampah Purchase Value
```

Gross spread:

```text
Bank Sampah Purchase Value
-
Customer Waste Value
```

Prototype assumption:

**15%**

Tetapi konfigurasi harus dapat diubah Admin.

---

# 21. Marketplace

Marketplace menghubungkan Customer dan UMKM.

Customer dapat:

* browse,
* search,
* melihat detail,
* checkout,
* melakukan payment.

UMKM dapat:

* membuat product,
* update stock,
* memproses order,
* melihat order history.

---

## 21.1 Order Lifecycle

```text
PENDING
↓
PAID
↓
PROCESSING
↓
SHIPPED
↓
DELIVERED
↓
COMPLETED
```

Auto-complete:

**3 hari**

setelah delivered jika tidak ada dispute.

---

## 21.2 Commission

Prototype:

```text
10% × Order Product Value
```

Configurable oleh Super Admin.

Shipping fee terpisah.

---

# 22. Carbon Impact

BuangYuk menggunakan istilah:

> **Estimated CO₂e Avoided**

Bukan klaim pengurangan emisi absolut.

---

## 22.1 Carbon Factor Priority

1. Indonesia credible source
2. EPA WARM fallback
3. TBD jika faktor valid tidak tersedia

Tidak boleh mengarang factor.

---

## 22.2 Carbon Factor Schema

```text
material
emissionFactor
unit
source
methodology
version
effectiveDate
lastUpdated
dataQuality
confidence
```

---

## 22.3 Carbon Snapshot

Transaction harus menyimpan factor yang digunakan pada saat calculation.

Jika tidak tersedia:

```text
carbonStatus = TBD
estimatedCo2eAvoided = null
```

---

# 23. Gamification

Customer memperoleh:

* Eco Points
* Badge
* Level

Contoh level:

```text
Beginner
↓
Explorer
↓
Eco Hero
↓
Circular Champion
```

Nama final level dapat configurable.

Tidak ada leaderboard dalam MVP.

---

# 24. Notification

Primary:

**Firebase Cloud Messaging**

Fallback:

**In-App Notification**

Tidak menggunakan SMS pada MVP.

---

## Notification Triggers

Contoh:

```text
Pickup Created
Collector Assigned
Collector Accepted
Collector Near
Collector Arrived
Verification Submitted
Confirmation Required
Transaction Completed
Payment Successful
Payment Failed
Dispute Created
Dispute Resolved
Earnings Available
Marketplace Order Updated
```

---

# 25. Dispute & Arbitration

Dispute memiliki:

**7 kategori**

Customer dapat membuat dispute berdasarkan kategori yang tersedia.

SLA:

**24 jam**

---

## 25.1 Lifecycle

```text
OPEN
↓
UNDER_REVIEW
↓
RESOLVED
```

Possible resolution:

```text
CUSTOMER_FAVOR
COLLECTOR_FAVOR
BANK_FAVOR
PARTIAL
REJECTED
```

Admin menjadi final decision maker.

---

## 25.2 Pro-Customer Auto Resolution

Jika kondisi rule memenuhi:

```text
Pro-Customer Auto Resolve
```

dapat dijalankan sesuai configured policy.

Semua resolution tetap dicatat dalam audit log.

---

# 26. Fraud Prevention

MVP menggunakan:

> **Rule-Based Fraud Detection**

Bukan AI/ML.

Contoh rule:

* repeated abnormal transaction,
* excessive cancellation,
* suspicious weight deviation,
* repeated dispute,
* abnormal location behavior,
* duplicate proof,
* unusual transaction frequency.

System membuat:

```text
fraudFlag
```

Admin melakukan final review.

---

## 26.1 Fraud Lifecycle

```text
FLAGGED
↓
UNDER_REVIEW
↓
CONFIRMED / CLEARED
```

Semua keputusan masuk audit log.

---

# 27. RBAC & Permission Matrix

| Feature            | Customer        | Collector    | Bank Sampah | UMKM           | Super Admin |
| ------------------ | --------------- | ------------ | ----------- | -------------- | ----------- |
| Own Profile        | RW              | RW           | RW          | RW             | Full        |
| Create Pickup      | C               | -            | -           | -              | Full        |
| View Pickup        | Own             | Assigned     | Related     | -              | Full        |
| Accept Pickup      | -               | Own          | -           | -              | Full        |
| Tracking           | Own             | Own          | Related     | -              | Full        |
| Waste Verification | Confirm         | Update       | View        | -              | Full        |
| Wallet             | Own             | Own Earnings | Settlement  | Seller Balance | Full        |
| Eco Points         | Own             | -            | -           | -              | Full        |
| Marketplace        | Browse/Buy      | -            | -           | Manage Seller  | Full        |
| Dispute            | Create/View Own | Related      | Related     | Related        | Full        |
| Fraud              | -               | -            | -           | -              | Full        |
| Config             | -               | -            | Own Ops     | Own Products   | Full        |
| Audit Logs         | -               | -            | -           | -              | Read        |

`C = Create`

`R = Read`

`W = Write`

Sensitive fields tidak boleh ditulis langsung oleh client.

---

# 28. Admin Features

Super Admin dapat:

### User Management

* view users,
* suspend,
* reactivate,
* role management.

### Pricing

* base price,
* grade factor,
* condition factor,
* region factor.

### Matching

* scoring weights,
* timeout,
* eligibility.

### Collector

* reliability,
* suspension,
* earnings.

### Bank Sampah

* capacity,
* material,
* pricing,
* settlement.

### Marketplace

* commission,
* product moderation.

### Dispute

* review,
* resolution,
* SLA monitoring.

### Fraud

* review flags,
* clear/confirm,
* audit trail.

### Carbon

* factor management.

---

# 29. Data Model / Firestore Structure

Existing database architecture **tetap menjadi baseline**.

## 29.1 Existing Root Collections

```text
Firestore Root
├── users/{userId}
├── user_eco_summaries/{userId}
├── waste_categories/{subCategoryId}
├── waste_transactions/{transactionId}
├── eco_point_redemptions/{redemptionId}
└── audit_logs/{logId}
```

Collection tersebut **tidak dihapus**.

---

## 29.2 Extended Collections

Untuk memenuhi MVP:

```text
Firestore Root
│
├── users/
├── user_eco_summaries/
├── waste_categories/
├── waste_transactions/
├── eco_point_redemptions/
├── audit_logs/
│
├── pickups/
├── collectors/
├── collector_locations/
├── collector_earnings/
│
├── waste_banks/
├── waste_bank_settlements/
│
├── wallets/
├── wallet_transactions/
│
├── marketplace_products/
├── marketplace_orders/
│
├── disputes/
├── fraud_flags/
├── notifications/
│
├── pricing_configs/
├── matching_configs/
├── carbon_factors/
├── system_configs/
└── admin_configs/
```

---

# 29.3 users

Existing schema:

| Field           | Type      |
| --------------- | --------- |
| uid             | String    |
| email           | String    |
| fullName        | String    |
| phoneNumber     | String    |
| role            | String    |
| address         | Object    |
| profilePhotoUrl | String    |
| createdAt       | Timestamp |
| updatedAt       | Timestamp |

Canonical role:

```text
CUSTOMER
COLLECTOR
BANK_SAMPAH
UMKM
SUPER_ADMIN
```

---

# 29.4 user_eco_summaries

Existing schema dipertahankan:

| Field                 | Type      |
| --------------------- | --------- |
| userId                | String    |
| totalVerifiedWeightKg | Number    |
| totalCo2eSavedKg      | Number    |
| totalEcoPoints        | Number    |
| totalCashEarned       | Number    |
| badgeLevel            | String    |
| lastUpdated           | Timestamp |

Untuk terminologi baru, `totalCo2eSavedKg` sebaiknya dipahami sebagai agregasi dari **Estimated CO₂e Avoided**, bukan absolute emissions claim.

---

# 29.5 waste_categories

Existing:

| Field                | Type    |
| -------------------- | ------- |
| id                   | String  |
| categoryGroup        | String  |
| materialName         | String  |
| unitType             | String  |
| conversionFactorToKg | Number  |
| emissionSavingFactor | Number  |
| basePricePerKg       | Number  |
| hazardousFlag        | Boolean |
| isActive             | Boolean |

Field lama dipertahankan untuk compatibility.

Namun carbon factor authoritative source diarahkan ke:

```text
carbon_factors/
```

dan pricing authoritative configuration diarahkan ke:

```text
pricing_configs/
```

---

# 29.6 waste_transactions

Existing fields dipertahankan:

```text
id
userId
status
categoryId
subCategoryId
inputQuantity
inputUnit
estimatedCo2eSaved
photoProofUrl
pickupMethod
verifiedWeightKg
verifiedCo2eSaved
earnedCash
earnedEcoPoints
verifierId
verifierNote
createdAt
verifiedAt
```

Additional recommended fields:

```text
pickupId
collectorId
bankId
regionId
verificationStatus
customerConfirmation
weightDeviationPercent
pricingSnapshot
carbonFactorSnapshot
disputeId
completedAt
```

---

# 29.7 pickups

```text
pickupId
transactionId
customerId
collectorId
regionId
status
pickupLocation
requestedAt
assignedAt
acceptedAt
enRouteAt
arrivedAt
verificationStartedAt
completedAt
acceptanceDeadline
reassignmentCount
estimatedDistance
actualDistance
createdAt
updatedAt
```

---

# 29.8 collectors

```text
collectorId
userId
availabilityStatus
serviceRegions
currentLocation
reliabilityScore
reliabilityStatus
dailyCapacity
currentLoad
totalCompletedPickups
totalCancelledPickups
suspendedUntil
createdAt
updatedAt
```

Reliability:

```text
0–100
```

Threshold:

```text
<60 → Warning
<40 → Suspend 24h
<20 → Admin Review
```

---

# 29.9 collector_locations

```text
locationId
collectorId
pickupId
latitude
longitude
accuracy
timestamp
createdAt
```

Retention strategy dapat dikonfigurasi untuk historical location data.

---

# 29.10 collector_earnings

```text
earningId
collectorId
pickupId
baseFee
commission
grossEarning
status
pendingUntil
availableAt
withdrawalId
createdAt
```

---

# 29.11 waste_banks

```text
bankId
name
regionId
address
location
acceptedMaterials
dailyCapacityKg
usedCapacityKg
operationalStatus
pricingConfigId
contactInfo
createdAt
updatedAt
```

---

# 29.12 waste_bank_settlements

```text
settlementId
bankId
transactionId
customerWasteValue
bankPurchaseValue
grossSpread
collectorCost
paymentFee
operationalCost
otherCost
settlementStatus
settlementDate
createdAt
```

---

# 29.13 wallets

```text
walletId
userId
cashBalance
ecoPointsBalance
currency
status
updatedAt
```

Balance tidak boleh dimodifikasi langsung oleh client.

---

# 29.14 wallet_transactions

```text
walletTransactionId
walletId
userId
type
amount
balanceBefore
balanceAfter
referenceType
referenceId
status
createdAt
```

---

# 29.15 eco_point_redemptions

Existing schema dipertahankan:

```text
userId
rewardItemId
rewardName
pointsSpent
status
redemptionCode
createdAt
```

---

# 29.16 marketplace_products

```text
productId
sellerId
name
description
category
price
stock
images
status
createdAt
updatedAt
```

---

# 29.17 marketplace_orders

```text
orderId
customerId
sellerId
items
productValue
commissionRate
commissionAmount
sellerReceivable
shippingFee
totalAmount
paymentStatus
orderStatus
deliveredAt
autoCompleteAt
createdAt
updatedAt
```

---

# 29.18 disputes

```text
disputeId
referenceType
referenceId
createdBy
category
description
evidence
status
slaDeadline
resolutionType
resolutionNote
resolvedBy
resolvedAt
createdAt
```

---

# 29.19 fraud_flags

```text
flagId
referenceType
referenceId
userId
ruleCode
severity
reason
status
reviewedBy
reviewNote
createdAt
resolvedAt
```

---

# 29.20 notifications

```text
notificationId
recipientId
type
title
body
referenceType
referenceId
channel
readAt
createdAt
```

---

# 29.21 pricing_configs

```text
configId
regionId
materialId
basePrice
gradeFactors
conditionFactors
regionFactor
effectiveFrom
effectiveUntil
isActive
updatedBy
updatedAt
```

---

# 29.22 matching_configs

```text
configId
distanceWeight
reliabilityWeight
availabilityWeight
capacityWeight
acceptanceWeight
otherWeight
acceptanceTimeoutSeconds
nearRadiusMeters
arrivedRadiusMeters
isActive
updatedAt
```

Default:

```text
25 / 25 / 15 / 15 / 10 / 10
60 seconds
500m
100m
```

---

# 29.23 carbon_factors

```text
factorId
material
emissionFactor
unit
source
methodology
version
effectiveDate
lastUpdated
dataQuality
confidence
isActive
```

---

# 29.24 audit_logs

Immutable top-level collection.

```text
logId
actorId
actorRole
action
resourceType
resourceId
before
after
metadata
timestamp
ipHash
userAgent
```

Audit log:

> Append-only.

Client:

> No write.

---

# 30. API Requirements

Backend API menggunakan NestJS.

## Authentication

```text
POST /auth/session
GET  /users/me
PATCH /users/me
```

---

## Pickup

```text
POST /pickups
GET /pickups/:id
POST /pickups/:id/cancel
POST /pickups/:id/accept
POST /pickups/:id/en-route
POST /pickups/:id/arrive
POST /pickups/:id/verify
POST /pickups/:id/confirm
```

---

## Matching

```text
POST /matching/evaluate
POST /matching/:pickupId/assign
POST /matching/:pickupId/reassign
```

---

## Wallet

```text
GET /wallet
GET /wallet/transactions
POST /wallet/cashout
```

---

## Marketplace

```text
GET /products
POST /products
PATCH /products/:id
POST /orders
GET /orders/:id
PATCH /orders/:id/status
```

---

## Dispute

```text
POST /disputes
GET /disputes/:id
POST /disputes/:id/resolve
```

---

## Admin

```text
GET /admin/dashboard
GET /admin/users
GET /admin/transactions
GET /admin/disputes
GET /admin/fraud
PATCH /admin/config/*
```

---

# 31. Realtime Tracking Architecture

Collector application mengirim lokasi setiap:

**5 seconds**

Architecture:

```text
Collector
   ↓
Location Service
   ↓
Firestore
   ↓
Customer Listener
   ↓
Live Map
```

Timestamp validation:

```text
if timestamp too old
→ reject/stale
```

Location update harus dikaitkan dengan:

```text
collectorId
pickupId
```

---

# 32. Maps Integration

Google Maps digunakan untuk:

* map rendering,
* route visualization,
* distance,
* geofencing support,
* collector location.

Google Maps harus diakses melalui abstraction layer.

Tujuan:

```text
MapProvider
├── GoogleMapsProvider
└── FutureProvider
```

Dengan demikian provider dapat diganti pada masa depan tanpa mengubah business logic utama.

---

# 33. File Storage

Existing Firebase Storage structure dipertahankan:

```text
storage-root/
├── profiles/
│   └── {userId}/
│       └── avatar.jpg
│
└── transactions/
    └── {userId}/
        └── {transactionId}/
            ├── waste_proof_overview.jpg
            └── waste_proof_detail.jpg
```

---

## File Rules

Maximum:

**5 MB**

Format:

* JPEG
* PNG
* WebP

Client wajib melakukan compression/resize.

Ownership:

```text
users/{userId}
```

hanya dapat menulis ke directory miliknya.

---

# 34. Authentication & Security

Authentication:

**Firebase Auth**

Supported:

* Google OAuth
* authenticated identity

Authorization:

**Firebase Security Rules + Backend authorization**

Sensitive operation harus melalui trusted backend.

Contoh:

* wallet balance,
* Eco Point balance,
* earnings,
* transaction settlement,
* fraud decision,
* audit log,
* admin configuration.

Client tidak boleh menulis langsung.

---

# 35. Audit Logging

Audit log wajib dibuat untuk:

* role changes,
* pricing changes,
* matching configuration changes,
* wallet adjustment,
* dispute resolution,
* fraud resolution,
* settlement,
* transaction adjustment,
* admin action.

Format:

```text
Actor
+
Action
+
Resource
+
Before
+
After
+
Timestamp
```

Audit logs tidak boleh diedit atau dihapus oleh client.

Retention:

**2 tahun**

Transaction data:

**Permanent**

---

# 36. Search Architecture

SearchService abstraction:

```text
SearchService
├── Firestore Query
├── Keyword Search
└── Client-side Filtering
```

Architecture harus Algolia-ready.

MVP tidak membutuhkan Algolia.

---

# 37. Offline Persistence

Firestore offline persistence digunakan.

Scope:

* cached data,
* pending reads/writes sesuai kemampuan Firestore.

MVP:

> Limited offline persistence.

Full offline-first:

> Future Scope.

---

# 38. Multi-Region Architecture

BuangYuk harus multi-region ready sejak awal.

Core entities memiliki:

```text
regionId
```

Region memengaruhi:

* pricing,
* Bank Sampah,
* collector availability,
* matching,
* capacity,
* operational configuration.

Initial deployment:

```text
Bandung
```

Architecture harus dapat diperluas:

```text
Bandung
↓
West Java
↓
National
```

Currency:

**IDR**

Language:

**Bahasa Indonesia**

---

# 39. Analytics & KPI

## Customer KPI

* total users
* active users
* pickup completion rate
* repeat pickup rate
* average transaction value
* average pickup time

## Collector KPI

* acceptance rate
* average response time
* completion rate
* cancellation rate
* reliability score

## Bank Sampah KPI

* incoming weight
* capacity utilization
* transaction count
* settlement value

## Marketplace KPI

* GMV
* order count
* average order value
* commission
* completion rate

## Platform KPI

* gross revenue
* gross spread
* operational cost
* contribution margin
* dispute rate
* fraud rate

---

# 40. ESG / Sustainability Metrics

Primary ESG differentiator:

> **Full Circular Ecosystem**

Supporting differentiators:

* Smart Matching
* Carbon impact
* Dynamic pricing

Carbon metric:

> **Estimated CO₂e Avoided**

Tidak boleh dipresentasikan sebagai absolute verified emissions reduction.

---

# 41. Demo Scenario — "Hari Minggu Ibu Sari"

## Act 1 — Customer

Ibu Sari membuka BuangYuk.

Ia memilih:

```text
Jual Sampah
```

Memilih material dan quantity.

Kemudian mengupload:

1. Overview photo
2. Detail photo

---

## Act 2 — Pricing

System menghitung estimated value berdasarkan:

```text
Base
× Grade
× Condition
× Region
```

Customer melihat estimasi.

---

## Act 3 — Matching

Customer membuat pickup.

System menjalankan:

**Weighted Scoring Engine**

Collector dengan score terbaik dipilih.

---

## Act 4 — Collector

Collector menerima notification.

Countdown:

**60 seconds**

Collector menerima pickup.

---

## Act 5 — Tracking

Collector bergerak menuju Ibu Sari.

Customer melihat live location.

Interval:

**5 seconds**

---

## Act 6 — Arrival

Collector memasuki:

```text
500m → Near
100m → Arrived
```

System mengubah state secara otomatis.

---

## Act 7 — Verification

Collector menimbang sampah.

Misalnya estimated weight berbeda signifikan.

Jika deviation:

```text
>50%
```

customer harus confirm ulang.

---

## Act 8 — Completion

Customer confirm.

System:

* finalizes transaction,
* calculates final value,
* adds wallet balance,
* adds Eco Points,
* updates eco summary,
* calculates Estimated CO₂e Avoided,
* updates Bank Sampah settlement,
* calculates collector earnings,
* writes audit log,
* sends notification.

Status:

```text
COMPLETED
```

---

# 42. Technical Architecture

## High-Level

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │ Customer / Admin /  │
                    │ Bank / UMKM UI      │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │      NestJS API     │
                    │ Business Logic      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Firestore │   │ Firebase   │   │   Maps     │
       │            │   │ Storage    │   │ Abstraction│
       └────────────┘   └────────────┘   └────────────┘
              │
              ↓
       ┌────────────┐
       │ Audit Logs │
       └────────────┘

       External Services
       ├── Midtrans Sandbox
       └── FCM
```

---

## 42.1 Frontend

Next.js.

Architecture:

```text
apps/
├── customer
├── collector
├── admin
├── bank-sampah
└── marketplace
```

atau satu Next.js application dengan role-based routing.

Final implementation dapat memilih monolith frontend untuk MVP selama RBAC tetap enforced.

---

## 42.2 Backend

NestJS modules:

```text
auth
users
pickups
matching
pricing
verification
wallet
payments
earnings
banks
marketplace
notifications
disputes
fraud
carbon
analytics
audit
admin
```

---

# 43. Non-Functional Requirements

## Performance

Target:

* common API response <2s under normal prototype load
* realtime location update every 5 seconds
* UI feedback for actions should be immediate where possible

## Availability

Prototype does not promise production SLA.

## Scalability

Architecture must support:

```text
Bandung
→ West Java
→ National
```

without redesigning core data model.

## Accessibility

Minimum:

* semantic HTML
* keyboard navigation
* WCAG AA-oriented contrast
* alt text
* accessible labels
* visible focus state

## Responsive

Customer / Collector:

**Mobile-first**

Admin / Bank Sampah:

**Desktop-first**

---

# 44. Error & Edge Cases

## Collector Timeout

```text
60 seconds
↓
Reassign
```

---

## No Collector Available

System:

```text
REQUESTED
↓
WAITING
```

Customer mendapat notification.

Fallback:

* retry matching,
* expanded candidate pool,
* manual/admin intervention.

---

## Bank Sampah Full

```text
Bank A = Full
↓
Find Partner Bank
```

---

## GPS Failure

Fallback:

```text
Manual Arrival Confirmation
```

---

## Weight Deviation >50%

```text
Verification
↓
Deviation Detected
↓
Customer Reconfirmation
```

---

## Payment Failure

```text
Payment Failed
↓
Retry
↓
Mock Fallback
```

untuk prototype.

---

## Dispute

Transaction tidak boleh dianggap fully settled jika terdapat blocking dispute.

---

## Duplicate Request

System dapat membuat fraud flag jika rule memenuhi.

---

## Stale Location

Jika timestamp location terlalu lama:

```text
Location = STALE
```

Customer melihat status yang sesuai.

---

# 45. Assumption Register

| ID    | Assumption                            | Status                               |
| ----- | ------------------------------------- | ------------------------------------ |
| A-001 | Initial market Bandung                | FINAL                                |
| A-002 | Architecture multi-region ready       | FINAL                                |
| A-003 | Currency IDR                          | FINAL                                |
| A-004 | Language Bahasa Indonesia             | FINAL                                |
| A-005 | Matching menggunakan weighted scoring | FINAL                                |
| A-006 | Matching weights 25/25/15/15/10/10    | FINAL                                |
| A-007 | Collector timeout 60 sec              | FINAL                                |
| A-008 | Near geofence 500m                    | FINAL                                |
| A-009 | Arrived geofence 100m                 | FINAL                                |
| A-010 | Tracking interval 5 sec               | FINAL                                |
| A-011 | Weight deviation threshold 50%        | FINAL                                |
| A-012 | Customer absence grace period 15 min  | FINAL                                |
| A-013 | Dispute SLA 24h                       | FINAL                                |
| A-014 | Bank capacity auto-confirm 24h        | FINAL                                |
| A-015 | Collector earnings hold 24h           | FINAL                                |
| A-016 | Minimum cashout Rp10k                 | FINAL                                |
| A-017 | Cashout fee Rp1k                      | FINAL                                |
| A-018 | Marketplace commission 10%            | PROTOTYPE ASSUMPTION                 |
| A-019 | Waste transaction gross spread 15%    | PROTOTYPE ASSUMPTION                 |
| A-020 | Bank SaaS pricing                     | PROTOTYPE ASSUMPTION                 |
| A-021 | Carbon source                         | FINAL PRIORITY, MATERIAL FACTORS TBD |
| A-022 | EPA WARM fallback                     | PROTOTYPE/FALLBACK                   |
| A-023 | Midtrans                              | Sandbox                              |
| A-024 | OTP                                   | Mock                                 |
| A-025 | Shipping                              | Mock                                 |
| A-026 | Fraud Detection                       | Rule-Based                           |
| A-027 | Smart Matching                        | Weighted Scoring Engine              |
| A-028 | AI/ML                                 | Future Scope                         |

---

# 46. Open Questions / TBD

Requirement gathering tetap dianggap **complete**.

Open items berikut tidak memblokir development.

## TBD-001 Carbon Factors

Faktor Indonesia yang relevan harus diidentifikasi per material.

Jika belum tersedia:

```text
TBD
```

Tidak boleh mengarang angka.

---

## TBD-002 Exact SaaS Price

Nominal:

```text
FREE/BASIC
PRO
ENTERPRISE/PARTNER
```

belum dikunci.

---

## TBD-003 Final Marketplace Commission

Prototype:

**10%**

Namun configurable.

---

## TBD-004 Final Waste Spread

Prototype:

**15%**

Namun configurable.

---

# 47. Acceptance Criteria

## AC-001 Authentication

**Given** customer belum login
**When** customer mencoba membuat pickup
**Then** system meminta authentication.

---

## AC-002 Pickup

**Given** customer authenticated
**When** customer mengisi waste data dan 2 photos
**Then** pickup dapat dibuat.

---

## AC-003 Matching

**Given** terdapat eligible collectors
**When** pickup dibuat
**Then** Weighted Scoring Engine menghasilkan ranking.

---

## AC-004 Timeout

**Given** collector menerima assignment
**When** collector tidak merespons selama 60 detik
**Then** system melakukan reassignment.

---

## AC-005 Tracking

**Given** collector accepted
**When** collector bergerak
**Then** location diperbarui dengan target interval 5 detik.

---

## AC-006 Geofence

**Given** collector bergerak menuju customer
**When** collector berada ≤500m
**Then** status Near aktif.

**When** ≤100m
**Then** system dapat menetapkan Arrived.

---

## AC-007 Verification

**Given** collector arrived
**When** collector mengirim verified weight
**Then** customer dapat melihat hasil verification.

---

## AC-008 Weight Deviation

**Given** deviation >50%
**When** collector submits verification
**Then** customer harus melakukan reconfirmation.

---

## AC-009 Wallet

**Given** transaction completed
**When** settlement succeeds
**Then** wallet balance diperbarui melalui trusted backend operation.

---

## AC-010 Eco Points

**Given** eligible transaction completed
**Then** Eco Points bertambah.

---

## AC-011 Carbon

**Given** valid carbon factor exists
**Then** system menghitung Estimated CO₂e Avoided.

**Given** factor tidak tersedia
**Then** value menjadi TBD/null.

---

## AC-012 Marketplace

**Given** product available
**When** customer checkout
**Then** order mengikuti:

```text
Pending
→ Paid
→ Processing
→ Shipped
→ Delivered
→ Completed
```

---

## AC-013 Dispute

**Given** customer membuat dispute
**Then** dispute memiliki category, SLA, status, dan audit trail.

---

## AC-014 Fraud

**Given** rule terpenuhi
**Then** system membuat fraud flag.

Tidak ada AI/ML claim.

---

## AC-015 Audit

**Given** Admin mengubah configuration
**Then** audit log dibuat.

---

# 48. Requirement Traceability / Coverage Matrix

| Requirement                | PRD Section | Status |
| -------------------------- | ----------- | ------ |
| Hybrid Business Model      | 6           | FINAL  |
| Bandung → National         | 38          | FINAL  |
| 5 Roles                    | 5           | FINAL  |
| Weighted Scoring Engine    | 14          | FINAL  |
| Collector Timeout          | 13, 14      | FINAL  |
| Dynamic Pricing            | 15          | FINAL  |
| Pickup State Machine       | 13          | FINAL  |
| Cancellation Policy        | 13          | FINAL  |
| Waste Verification         | 16          | FINAL  |
| Weight Deviation           | 16, 44      | FINAL  |
| Customer Absence           | 44          | FINAL  |
| Dispute Lifecycle          | 25          | FINAL  |
| Geofencing                 | 32          | FINAL  |
| Proof of Waste             | 16, 33      | FINAL  |
| Realtime Tracking          | 31          | FINAL  |
| Google Maps                | 32          | FINAL  |
| FCM                        | 24          | FINAL  |
| Firebase Storage           | 33          | FINAL  |
| Transaction PIN / Mock OTP | 18          | FINAL  |
| Midtrans / Mock            | 18          | FINAL  |
| Firestore                  | 29          | FINAL  |
| SearchService              | 36          | FINAL  |
| Offline Persistence        | 37          | FINAL  |
| Audit Log                  | 35          | FINAL  |
| Visual Style               | UI/UX Scope | FINAL  |
| Responsive                 | 43          | FINAL  |
| Demo Scenario              | 41          | FINAL  |
| ESG Differentiator         | 40          | FINAL  |
| Accessibility              | 43          | FINAL  |
| Carbon Impact              | 22          | FINAL  |
| Collector Earnings         | 19          | FINAL  |
| Bank Settlement            | 20          | FINAL  |
| Wallet                     | 17          | FINAL  |
| RBAC                       | 27          | FINAL  |
| Reliability Score          | 14, 29      | FINAL  |
| Bank Capacity              | 20          | FINAL  |
| Marketplace Lifecycle      | 21          | FINAL  |
| Rule-Based Fraud           | 26          | FINAL  |
| Earnings Hold              | 19          | FINAL  |

---

# FINAL REQUIREMENT STATUS

## 🟢 FINAL REQUIREMENT

Requirement gathering:

**COMPLETE**

Tidak ada critical gap.

Tidak ada conflict.

---

## 🟡 PROTOTYPE ASSUMPTION

Angka yang tidak boleh dianggap sebagai business rule nasional:

```text
Marketplace Commission = 10%
Waste Gross Spread = 15%
Bank Sampah SaaS Pricing
```

Seluruhnya configurable.

---

## 🔵 FUTURE SCOPE

AI/ML, real e-wallet, real shipping API, full offline, chat, blockchain, IoT, native apps, dan fitur lain yang telah ditentukan **tidak termasuk MVP**.

---

## 🟠 TBD

Carbon factor spesifik material yang belum memiliki sumber valid.

Jika tidak ada data yang memenuhi kriteria:

```text
Estimated CO₂e Avoided = TBD
```

Tidak boleh mengarang angka.

---

# PRODUCT DECISION SUMMARY

BuangYuk MVP secara teknis menggunakan:

```text
Frontend
Next.js

Backend
NestJS

Authentication
Firebase Auth

Database
Cloud Firestore

Storage
Firebase Storage

Realtime
Firestore Listener

Notification
FCM

Maps
Google Maps + Abstraction Layer

Payment
Midtrans Sandbox + Mock

Search
Firestore + Keyword + Client Filtering

Architecture
Multi-region ready

Matching
Weighted Scoring Engine

Fraud
Rule-Based Fraud Detection

Carbon
Estimated CO₂e Avoided
```

Core business flow:

```text
CUSTOMER
   │
   │ Waste Request
   ▼
BUANGYUK
   │
   ├── Weighted Scoring
   ├── Dynamic Pricing
   ├── Geofencing
   ├── Tracking
   ├── Verification
   ├── Wallet
   ├── Rewards
   └── Audit
   │
   ▼
COLLECTOR
   │
   ▼
BANK SAMPAH
   │
   ▼
CIRCULAR ECONOMY
   │
   └── UMKM MARKETPLACE
```

**PRD Status: READY FOR UI/UX + DATABASE + API + DEVELOPMENT**
