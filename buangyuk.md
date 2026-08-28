# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## BuangYuk — Circular Waste Marketplace & Smart Pickup Platform

**Document Status:** FINAL — Requirement Gathering Complete
**Version:** PRD v1.0
**Date:** 27 August 2026
**Product Stage:** MVP / Prototype
**Initial Market:** Bandung → Nasional
**Primary Language:** Bahasa Indonesia
**Currency:** IDR
**Architecture:** Multi-region ready
**Frontend:** Next.js
**Backend:** NestJS
**Database:** Cloud Firestore
**Authentication:** Firebase Auth / Google OAuth
**Maps:** Google Maps
**Payment:** Midtrans Sandbox + Mock Fallback
**Notification:** Firebase Cloud Messaging (FCM)

---

# 1. Product Overview

**BuangYuk** adalah platform digital yang menghubungkan:

**Customer → Collector → Bank Sampah → UMKM → Marketplace**

dalam satu ekosistem pengelolaan sampah berbasis circular economy.

BuangYuk mengotomatisasi proses pickup sampah seperti model ride-hailing:

1. Customer membuat permintaan pickup.
2. Sistem menghitung harga sampah.
3. Sistem mencari Collector yang sesuai.
4. Collector menerima atau menolak order.
5. Sistem melakukan geofencing dan tracking.
6. Collector mengambil dan memverifikasi sampah.
7. Customer melakukan konfirmasi.
8. Nilai transaksi masuk ke wallet/settlement.
9. Sampah diteruskan ke Bank Sampah.
10. Material dapat masuk ke ekosistem pengolahan/marketplace.
11. Customer memperoleh Eco Points dan informasi dampak lingkungan.

BuangYuk **bukan sekadar aplikasi pickup sampah**, tetapi platform perantara yang menghubungkan sisi supply, collection, processing, marketplace, dan sustainability metrics.

---

# 2. Problem Statement

Permasalahan yang ingin diselesaikan:

### Customer

* Tidak selalu mengetahui ke mana sampah bernilai harus disalurkan.
* Harga sampah tidak transparan.
* Pickup manual sulit diprediksi.
* Tidak ada tracking seperti layanan delivery.
* Bukti transaksi dan verifikasi sering tidak terdokumentasi dengan baik.

### Collector

* Kesulitan memperoleh order secara konsisten.
* Tidak ada mekanisme matching yang terstruktur.
* Pendapatan dan settlement sulit dilacak.
* Perlu mekanisme reliability score.

### Bank Sampah

* Supply sampah tidak selalu terprediksi.
* Kapasitas harian terbatas.
* Administrasi transaksi dapat dilakukan secara manual.
* Tidak memiliki dashboard operasional terpadu.

### UMKM

* Membutuhkan kanal marketplace untuk produk circular/recycled.
* Membutuhkan sistem transaksi dan settlement yang terstruktur.

### Platform

* Membutuhkan model bisnis yang dapat menghasilkan revenue.
* Membutuhkan audit trail dan fraud prevention.
* Membutuhkan sistem yang dapat berkembang dari Bandung menjadi nasional.

---

# 3. Vision & Goals

## Vision

> Menjadi platform digital yang membuat pengelolaan sampah bernilai semudah memesan layanan pickup, sekaligus menghubungkan masyarakat dengan ekosistem circular economy.

## MVP Goals

1. Mendemonstrasikan 5 role secara end-to-end.
2. Membuat pickup automation seperti ride-hailing.
3. Mengimplementasikan Weighted Scoring Engine.
4. Mengimplementasikan realtime tracking.
5. Mengimplementasikan geofencing.
6. Menyediakan dynamic waste pricing.
7. Menyediakan verification dan dispute lifecycle.
8. Menyediakan wallet dan Eco Points.
9. Menghubungkan customer dengan Bank Sampah.
10. Menyediakan marketplace UMKM.
11. Menyediakan dashboard Admin.
12. Menampilkan Estimated CO₂e Avoided secara transparan.

---

# 4. Target Users

| User        | Kebutuhan Utama                         |
| ----------- | --------------------------------------- |
| Customer    | Menjual/menyerahkan sampah dengan mudah |
| Collector   | Mendapatkan pickup dan pendapatan       |
| Bank Sampah | Mengelola supply dan kapasitas          |
| UMKM        | Menjual produk circular                 |
| Super Admin | Mengelola keseluruhan platform          |

## Initial Geographic Market

**Phase 1:** Bandung
**Phase 2:** Region Jawa Barat
**Phase 3:** Nasional

Arsitektur tidak boleh mengasumsikan Bandung sebagai satu-satunya region.

---

# 5. User Roles

## 5.1 Customer

Kemampuan:

* Login
* Membuat pickup
* Upload 2 foto
* Melihat estimasi harga
* Melihat Collector
* Melihat tracking
* Konfirmasi hasil pickup
* Mengelola wallet
* Cashout
* Menggunakan Eco Points
* Marketplace
* Checkout
* Melihat carbon impact
* Mengajukan dispute

## 5.2 Collector

Kemampuan:

* Login
* Melihat available jobs
* Menerima pickup
* Menolak pickup
* Tracking location
* Update pickup state
* Upload verification
* Melihat earnings
* Melihat reliability score
* Withdrawal

## 5.3 Bank Sampah

Kemampuan:

* Melihat pickup/supply
* Mengelola material acceptance
* Mengelola capacity
* Mengelola settlement
* Dashboard transaksi
* Operational management

## 5.4 UMKM

Kemampuan:

* Mengelola produk
* Mengelola inventory
* Melihat order
* Memproses order
* Shipping mock
* Melihat settlement

## 5.5 Super Admin

Kemampuan:

* User management
* Role management
* Region configuration
* Pricing configuration
* Commission configuration
* Matching configuration
* Fraud review
* Dispute arbitration
* Bank Sampah management
* Marketplace configuration
* Audit log
* Analytics
* System configuration

---

# 6. Business Model

BuangYuk menggunakan **Hybrid Business Model**:

1. Waste transaction gross spread
2. Marketplace commission
3. Bank Sampah SaaS
4. Marketplace
5. Reward ecosystem

## 6.1 Waste Transaction

BuangYuk berfungsi sebagai **Platform Intermediary**.

Model:

```text
Customer Waste Value
        ↓
BuangYuk Acquisition Value
        ↓
BuangYuk Selling Value
        ↓
Bank Sampah Purchase Value
```

### Gross Spread

```text
Gross Spread =
Bank Sampah Purchase Value
-
Customer Waste Value
```

Prototype assumption:

**15% platform gross spread**

Namun angka tersebut **configurable** dan bukan harga/margin nasional.

Admin dapat mengatur:

* Customer acquisition price
* Bank Sampah purchase price
* Collector base fee
* Collector commission
* Platform margin/markup
* Payment fee
* Operational cost
* Other cost

---

# 7. Value Proposition

## Customer

> "Buang sampah bernilai semudah memesan pickup."

## Collector

> "Dapatkan pickup yang lebih terstruktur dan transparan."

## Bank Sampah

> "Dapatkan supply yang lebih terorganisasi."

## UMKM

> "Jual produk circular melalui marketplace."

## Platform

> "Menghubungkan seluruh rantai circular economy dalam satu platform."

---

# 8. Product Scope

## Included

* Customer application
* Collector application
* Bank Sampah dashboard
* UMKM marketplace
* Super Admin dashboard
* Pickup management
* Matching
* Tracking
* Pricing
* Verification
* Wallet
* Rewards
* Marketplace
* Notifications
* Disputes
* Fraud flags
* Audit logs
* Carbon impact

## Excluded from MVP

* AI image recognition
* AI fraud detection
* Real e-wallet integration
* Real SMS/WhatsApp OTP
* Real shipping API
* Native iOS/Android
* Full offline-first
* Blockchain
* IoT smart scale
* Chat system

---

# 9. MVP Scope

MVP wajib mendemonstrasikan:

* 5-role end-to-end flow
* Weighted Scoring Engine
* Realtime Tracking 5-second interval
* Geofencing 500m/100m
* Dynamic Pricing
* 2-photo Proof of Waste
* Waste Verification
* Wallet
* Eco Points
* Cashout
* FCM
* Google Maps
* Firebase Auth / Google OAuth
* Marketplace
* Bank Sampah capacity
* Admin dashboard
* Carbon calculator
* Basic gamification
* Dispute
* Audit log
* Rule-Based Fraud Detection
* Midtrans Sandbox + Mock Fallback

---

# 10. Future Scope

Future Scope **tidak dianggap tersedia pada MVP**.

* AI/ML waste classification
* AI/ML fraud detection
* AI/ML demand prediction
* Adaptive GPS tracking
* Full Offline-First/PWA
* Real SMS/WhatsApp OTP
* DANA/GoPay/OVO integration
* JNE/J&T/SiCepat integration
* Escrow
* Volume factor
* Seasonal pricing
* Leaderboard
* Customer ↔ Collector chat
* Voice note/video proof
* Bank Sampah subscription billing
* English language
* Advanced heatmap
* IoT smart scale
* Blockchain traceability
* Native mobile apps

---

# 11. User Journey

```text
Customer
  ↓
Create Pickup
  ↓
Upload 2 Photos
  ↓
Pricing Calculation
  ↓
Matching Engine
  ↓
Collector Assigned
  ↓
Collector Accepts
  ↓
Collector Travels
  ↓
Geofence
  ↓
Arrived
  ↓
Waste Verification
  ↓
Customer Confirmation
  ↓
Transaction Settlement
  ↓
Wallet / Rewards
  ↓
Bank Sampah
  ↓
Circular Ecosystem
```

---

# 12. Detailed Functional Requirements

## FR-001 — Authentication

Firebase Auth wajib mendukung:

* Google OAuth
* Session management
* Role assignment
* Secure token validation

Mock OTP dapat digunakan untuk prototype.

OTP tidak boleh disimpan sebagai plaintext.

## FR-002 — Pickup Creation

Customer memasukkan:

* Waste category
* Material
* Estimated weight
* Pickup address
* Pickup coordinates
* Preferred time
* Notes
* 2 photos

System menghasilkan:

* Pickup ID
* Pricing estimate
* Pickup status

## FR-003 — Proof of Waste

Customer wajib mengunggah:

1. Overview photo
2. Detail photo

Image:

* dikompresi client-side
* di-resize bila diperlukan
* disimpan Firebase Storage
* dilindungi RBAC

## FR-004 — Matching

Sistem menjalankan Weighted Scoring Engine.

Bukan AI/ML.

## FR-005 — Collector Acceptance

Collector memiliki:

**60 detik**

untuk menerima assignment.

Jika timeout:

```text
Assigned
 ↓
60 sec timeout
 ↓
Expired
 ↓
Re-match
```

Timeout configurable.

## FR-006 — Tracking

Collector location dikirim setiap:

**5 detik**

Data memiliki timestamp validation.

## FR-007 — Geofencing

Threshold:

* ≤500m = Near
* ≤100m = Auto Arrived

Fallback:

**Manual Arrived**

## FR-008 — Verification

Collector memasukkan hasil aktual:

* Weight
* Grade
* Condition
* Material

Customer melakukan:

**1-tap confirmation**

## FR-009 — Weight Deviation

Jika:

```text
Deviation > 50%
```

maka:

**explicit customer re-confirmation**

Threshold configurable.

## FR-010 — Customer Absence

Grace period:

**15 menit**

Setelah timeout:

```text
Collector Waiting
 ↓
15 min
 ↓
Auto Cancel
```

## FR-011 — Cancellation

Cancellation penalty bersifat escalating.

Jika Collector belum OTW:

**Free cancellation**

Parameter configurable.

## FR-012 — Dispute

Customer dapat membuat dispute.

Kategori:

1. Weight
2. Price
3. Material
4. Condition
5. Pickup
6. Payment
7. Other

SLA:

**24 jam**

Pro-customer auto-resolution dapat diterapkan berdasarkan rule yang telah ditentukan.

Admin tetap memiliki keputusan final pada dispute yang memerlukan arbitration.

---

# 13. Pickup Lifecycle / State Machine

Pickup menggunakan 8 state:

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

Exception states:

```text
CANCELLED
EXPIRED
DISPUTED
FAILED
```

## State Rules

### REQUESTED

Customer berhasil membuat pickup.

### MATCHING

System mencari Collector.

### ASSIGNED

Collector dipilih.

### ACCEPTED

Collector menerima.

### EN_ROUTE

Collector bergerak menuju customer.

### ARRIVED

Geofence ≤100m atau manual fallback.

### VERIFYING

Collector melakukan verification.

### COMPLETED

Customer confirmation selesai dan settlement dapat diproses.

State transition harus dilakukan oleh server/backend berdasarkan role dan business rule.

Client tidak boleh menulis state sensitif secara langsung.

---

# 14. Smart Matching Engine

Nama resmi:

**Weighted Scoring Engine**

Bukan AI/ML.

Formula:

```text
Score =
Distance × 25%
+
Reliability × 25%
+
Capacity × 15%
+
Availability × 15%
+
Experience × 10%
+
Region Fit × 10%
```

Bobot:

| Factor       | Weight |
| ------------ | -----: |
| Distance     |    25% |
| Reliability  |    25% |
| Capacity     |    15% |
| Availability |    15% |
| Experience   |    10% |
| Region Fit   |    10% |

Semua bobot configurable.

## Matching Flow

```text
Pickup Request
 ↓
Find eligible collectors
 ↓
Filter region
 ↓
Filter availability
 ↓
Filter capacity
 ↓
Calculate score
 ↓
Rank candidates
 ↓
Assign highest eligible candidate
 ↓
60 sec acceptance
 ↓
Timeout?
 ├─ No → Continue
 └─ Yes → Reassign
```

---

# 15. Dynamic Waste Pricing

Formula:

```text
Waste Price =
Base Price
× Grade Factor
× Condition Factor
× Region Factor
```

Contoh struktur:

```text
Material: Plastic PET
Region: Bandung
Grade: A
Condition: Clean

Base Price = configurable
Grade Factor = configurable
Condition Factor = configurable
Region Factor = configurable
```

Harga tidak boleh dianggap sebagai:

* harga nasional
* harga permanen
* harga publik universal

Harga harus dapat dikonfigurasi berdasarkan:

* Region
* Bank Sampah
* Material
* Grade
* Condition
* Effective date

---

# 16. Waste Verification

Collector menginput:

* actual weight
* actual material
* grade
* condition
* notes
* verification timestamp

Customer melihat hasil.

Jika deviation ≤ threshold:

```text
Normal confirmation
```

Jika deviation >50%:

```text
Re-confirmation required
```

Jika customer dispute:

```text
DISPUTED
 ↓
Admin Review
```

---

# 17. Wallet & Rewards

Wallet dipisahkan menjadi:

## 17.1 Balance

Digunakan untuk:

* cashout
* marketplace-related eligible balance

Minimum cashout:

**Rp10.000**

Cashout fee:

**Rp1.000**

Keduanya configurable.

## 17.2 Eco Points

Eco Points:

* tidak dapat dicairkan menjadi uang
* digunakan untuk voucher/reward
* dapat menghasilkan badge/level

Pemisahan ini penting agar Eco Points tidak dianggap sebagai monetary balance.

---

# 18. Payment

Payment architecture:

```text
Customer
   ↓
Midtrans Sandbox
   ↓
Success / Failure
   ↓
BuangYuk Backend
```

Mock fallback:

```text
Mock Payment
 ↓
Simulated Success
```

MVP:

* Midtrans Sandbox
* Mock fallback

Tidak boleh diklaim sebagai production payment integration.

---

# 19. Collector Earnings

Collector earnings:

```text
Base Fee
+
Commission
=
Gross Collector Earnings
```

Kemudian:

```text
Gross Earnings
-
Applicable Adjustments
=
Net Available
```

Status:

```text
PENDING
 ↓
24 hours
 ↓
AVAILABLE
 ↓
WITHDRAWAL
```

Hold:

**24 jam**

Configurable.

Collector dapat melihat:

* pending
* available
* withdrawn
* transaction history

---

# 20. Bank Sampah Operations & Settlement

Bank Sampah memiliki:

* daily capacity
* accepted material
* pricing configuration
* incoming supply
* settlement records

## Capacity

Jika capacity penuh:

```text
Bank Sampah A
 ↓
FULL
 ↓
Fallback Partner
```

System mencari partner fallback.

## Auto Confirmation

Bank Sampah memiliki:

**24 jam**

untuk confirmation sesuai workflow.

## Settlement

BuangYuk bertindak sebagai intermediary.

Model:

```text
Customer Acquisition Value
        ↓
BuangYuk
        ↓
Bank Sampah Purchase Value
```

Gross Spread:

```text
Bank Sampah Purchase Value
-
Customer Waste Value
```

Prototype assumption:

**15% gross spread**

Configurable.

---

# 21. Marketplace

Marketplace menghubungkan Customer dengan UMKM.

## Order Lifecycle

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

**3 hari setelah Delivered**

## Marketplace Commission

Prototype assumption:

**10%**

Formula:

```text
Marketplace Commission =
Order Product Value × Commission Rate
```

Seller:

```text
Seller Receives =
Order Product Value
-
Marketplace Commission
```

Shipping fee:

**dipisahkan dari marketplace commission.**

Rate configurable oleh Super Admin.

---

# 22. Carbon Impact

BuangYuk menggunakan istilah:

> **Estimated CO₂e Avoided**

Bukan:

> "pengurangan emisi absolut"

## Data Model

Setiap emission factor wajib menyimpan:

* Material
* Emission factor
* Unit
* Source
* Methodology
* Version
* Effective date
* Last updated
* Data quality/confidence

## Source Priority

1. Indonesia-specific credible source.
2. EPA WARM fallback jika data Indonesia yang relevan belum tersedia.
3. TBD jika faktor yang valid belum tersedia.

Dalam research pass untuk PRD ini, EPA WARM Version 16 merupakan fallback yang dapat dipertanggungjawabkan; dokumentasinya menggunakan faktor material-specific dan pendekatan lifecycle untuk pengelolaan material. ([EPA NEO ][1])

EPA WARM juga menegaskan bahwa faktor recycling bersifat komparatif terhadap baseline waste-management pathway, sehingga BuangYuk tidak boleh mengubahnya menjadi klaim pengurangan emisi absolut. ([EPA NEO ][1])

Jika proxy WARM digunakan untuk material/pathway yang tidak tersedia, uncertainty harus dicatat karena EPA sendiri memperingatkan bahwa proxy dapat memiliki ketidakpastian besar. ([EPA NEO ][2])

## Calculation

Secara konseptual:

```text
Estimated CO₂e Avoided
=
Verified Material Weight
×
Applicable Emission Factor
```

Namun implementasi final harus mengikuti methodology emission factor yang dipilih.

Jika factor tidak tersedia:

```text
CO₂e = TBD
```

Jangan mengarang angka.

## Visualization

Customer melihat:

* material recycled/recovered
* verified weight
* Estimated CO₂e Avoided
* simple analogy
* light gamification

Tidak ada leaderboard.

---

# 23. Gamification

MVP:

* Eco Points
* Badge
* Level

Gamification tidak boleh mengubah Eco Points menjadi cash.

Contoh:

```text
Pickup completed
 ↓
Eco Points
 ↓
Level progress
 ↓
Badge
```

Leaderboard masuk Future Scope.

---

# 24. Notification

Primary:

**Firebase Cloud Messaging (FCM)**

Fallback:

**In-App Notification**

Tidak menggunakan SMS untuk MVP.

## Trigger Examples

* Pickup created
* Collector assigned
* Collector accepted
* Collector arriving
* Collector arrived
* Verification required
* Customer confirmation required
* Pickup completed
* Payment successful
* Payment failed
* Dispute created
* Dispute resolved
* Earnings available

Notification harus trigger-based.

---

# 25. Dispute & Arbitration

## Lifecycle

```text
OPEN
 ↓
UNDER_REVIEW
 ↓
RESOLVED
```

Possible outcome:

* Customer favored
* Collector favored
* Bank Sampah favored
* Partial adjustment

SLA:

**24 hours**

Admin memiliki final arbitration authority.

Setiap keputusan harus menghasilkan audit log.

---

# 26. Fraud Prevention

Nama resmi:

**Rule-Based Fraud Detection**

Bukan AI/ML.

## Example Rules

System dapat membuat flag jika:

* excessive cancellation
* abnormal weight deviation
* repeated dispute
* suspicious transaction frequency
* impossible GPS movement
* duplicate proof
* repeated failed payment
* unusual activity pattern

Output:

```text
NORMAL
FLAGGED
UNDER_REVIEW
RESOLVED
```

System hanya memberikan **flag**.

Admin memiliki keputusan final.

Semua review dicatat dalam audit trail.

---

# 27. RBAC & Permission Matrix

| Feature        |     Customer |    Collector |         Bank |         UMKM |    Admin |
| -------------- | -----------: | -----------: | -----------: | -----------: | -------: |
| Own Profile    |           RW |           RW |           RW |           RW |     CRUD |
| Create Pickup  |            C |            - |            - |            - | Override |
| Accept Pickup  |            - |           RW |            - |            - | Override |
| Tracking       |          Own |          Own |      Limited |            - |     Read |
| Verification   |      Confirm |       Create |       Review |            - | Override |
| Wallet         |           RW |           RW |   Settlement |   Settlement |    Admin |
| Marketplace    |        Buyer |            - |            - |       Seller |    Admin |
| Product        |            - |            - |            - |         CRUD |    Admin |
| Dispute        |       Create |      Respond |      Respond |      Respond |  Resolve |
| Pricing Config |            - |            - |      Limited |            - |     CRUD |
| Region Config  |            - |            - |            - |            - |     CRUD |
| Fraud Review   |            - |            - |            - |            - |     CRUD |
| Audit Log      | Own relevant | Own relevant | Own relevant | Own relevant |     Read |

Sensitive fields harus server-controlled.

Client tidak boleh menulis langsung:

* transaction amount
* wallet balance
* commission
* settlement status
* fraud status
* audit log
* role
* pricing configuration
* system state

---

# 28. Admin Features

Admin dashboard mencakup:

## Operations

* Active pickups
* Failed pickups
* Collector availability
* Bank Sampah capacity

## Financial

* GMV
* Waste transaction value
* Gross spread
* Collector earnings
* Marketplace commission
* Payment fees
* Operational costs
* Contribution margin

## Risk

* Fraud flags
* Disputes
* Reliability issues

## Configuration

* Pricing
* Matching weights
* Region
* Commission
* Collector fee
* Cashout fee
* Reward rules
* Capacity

## Audit

Admin dapat melihat immutable audit events.

---

# 29. Data Model / Firestore Structure

Arsitektur menggunakan kombinasi top-level collections dan subcollections.

```text
/users/{userId}

/roles/{roleId}

/regions/{regionId}

/materials/{materialId}

/pricing_configs/{pricingConfigId}

/emission_factors/{factorId}

/pickups/{pickupId}

/pickups/{pickupId}/tracking/{trackingId}

/pickups/{pickupId}/events/{eventId}

/pickups/{pickupId}/verification/{verificationId}

/collectors/{collectorId}

/collectors/{collectorId}/earnings/{earningId}

/banks/{bankId}

/banks/{bankId}/capacity/{capacityId}

/settlements/{settlementId}

/wallets/{walletId}

/wallets/{walletId}/transactions/{transactionId}

/eco_points/{pointLedgerId}

/marketplace_products/{productId}

/marketplace_orders/{orderId}

/marketplace_orders/{orderId}/events/{eventId}

/disputes/{disputeId}

/fraud_flags/{flagId}

/notifications/{notificationId}

/audit_logs/{auditId}

/configs/{configId}
```

## Core Pickup Document

```text
pickupId
customerId
collectorId
bankId
regionId
status
wasteItems[]
estimatedWeight
verifiedWeight
estimatedValue
finalValue
pickupLocation
destinationLocation
pricingSnapshot
matchingSnapshot
proofPhotoIds[]
createdAt
assignedAt
acceptedAt
arrivedAt
verifiedAt
completedAt
cancelledAt
```

## Important Principle

Historical transactions harus menyimpan **snapshot** dari pricing/configuration yang digunakan saat transaksi.

Perubahan konfigurasi masa depan tidak boleh mengubah transaksi historis.

---

# 30. API Requirements

Backend menggunakan NestJS.

## Authentication

```http
POST /auth/session
GET /auth/me
```

## Pickup

```http
POST /pickups
GET /pickups/:id
POST /pickups/:id/cancel
POST /pickups/:id/confirm
```

## Matching

```http
POST /pickups/:id/match
POST /pickups/:id/reassign
POST /assignments/:id/accept
POST /assignments/:id/timeout
```

## Tracking

```http
POST /pickups/:id/tracking
GET /pickups/:id/tracking
```

## Verification

```http
POST /pickups/:id/verification
POST /pickups/:id/reconfirm
```

## Wallet

```http
GET /wallet
GET /wallet/transactions
POST /wallet/cashout
```

## Marketplace

```http
GET /products
POST /products
POST /orders
GET /orders/:id
POST /orders/:id/pay
POST /orders/:id/ship
POST /orders/:id/complete
```

## Dispute

```http
POST /disputes
GET /disputes/:id
POST /disputes/:id/review
POST /disputes/:id/resolve
```

## Admin

```http
GET /admin/analytics
GET /admin/fraud-flags
GET /admin/disputes
GET /admin/audit-logs
PUT /admin/config
```

API names are implementation references; final route naming may follow backend conventions without changing business requirements.

---

# 31. Realtime Tracking Architecture

Collector device:

```text
GPS
 ↓
5-second interval
 ↓
Validation
 ↓
Backend/Firestore
 ↓
Customer listener
 ↓
Map marker update
```

Tracking record:

```text
trackingId
pickupId
collectorId
latitude
longitude
accuracy
timestamp
createdAt
```

## Validation

Backend checks:

* timestamp
* authorized collector
* active pickup
* coordinate validity
* abnormal movement

Historical tracking should not be overwritten.

---

# 32. Maps Integration

Primary:

**Google Maps**

Use abstraction layer:

```text
MapProvider
 ├── GoogleMapsProvider
 └── FutureProvider
```

Functions:

* geocoding
* reverse geocoding
* map display
* marker
* route/distance
* geofence calculation

This prevents business logic from being tightly coupled to one provider.

---

# 33. File Storage

Firebase Storage.

Directories:

```text
/users/{userId}/
/pickups/{pickupId}/proof/
/pickups/{pickupId}/verification/
/marketplace/{productId}/
```

Requirements:

* client-side compression
* client-side resize
* MIME validation
* file size validation
* authenticated access
* RBAC
* signed/authorized access where appropriate

Customer proof must not be publicly accessible by default.

---

# 34. Authentication & Security

Firebase Auth handles authentication.

Backend must validate Firebase ID tokens.

Security principles:

* least privilege
* server-side authorization
* Firestore Security Rules
* NestJS guards
* role verification
* input validation
* rate limiting
* secure payment callbacks
* audit sensitive actions

Sensitive financial fields must never rely solely on client validation.

---

# 35. Audit Logging

Audit log is:

**Immutable / Append-only**

Example:

```text
auditId
actorId
actorRole
action
entityType
entityId
before
after
reason
ipHash/reference
timestamp
metadata
```

Examples:

```text
ADMIN_CHANGED_PRICE
COLLECTOR_ACCEPTED_PICKUP
CUSTOMER_CONFIRMED_WEIGHT
ADMIN_RESOLVED_DISPUTE
ADMIN_REVIEWED_FRAUD
WALLET_WITHDRAWAL_REQUESTED
```

No client direct write.

---

# 36. Search Architecture

MVP:

```text
Firestore Query
+
Keyword fields
+
Client-side filtering
```

SearchService abstraction:

```text
SearchService
 ├── FirestoreSearchService
 └── Future AlgoliaSearchService
```

Algolia is Future Scope for scaling search.

---

# 37. Offline Persistence

Firestore offline persistence digunakan untuk limited scenarios.

Supported:

* cached data
* basic reads
* limited queued writes according to Firestore behavior

Tidak boleh diklaim sebagai:

**Full Offline-First**

Full Offline-First/PWA adalah Future Scope.

Critical financial/state transitions tetap membutuhkan server synchronization.

---

# 38. Multi-Region Architecture

Region menjadi first-class entity.

```text
Country
 ↓
Province
 ↓
City
 ↓
Operational Region
 ↓
Bank Sampah
 ↓
Collectors
```

Contoh:

```text
Indonesia
 └── Jawa Barat
      └── Bandung
           └── Region A
```

Setiap transaction menyimpan:

```text
regionId
```

Pricing, matching, capacity, dan availability dapat menggunakan region.

---

# 39. Analytics & KPI

## Marketplace

* GMV
* Orders
* Conversion
* Average Order Value

## Pickup

* Requests
* Completed pickups
* Cancellation rate
* Average matching time
* Acceptance rate
* Average pickup time

## Collector

* Earnings
* Acceptance rate
* Completion rate
* Reliability score

## Bank Sampah

* Incoming weight
* Capacity utilization
* Settlement value

## Financial

```text
Revenue
Gross Margin
Operational Cost
Contribution Margin
```

Jangan mencampur istilah tersebut.

---

# 40. ESG / Sustainability Metrics

Core metrics:

* Waste collected
* Waste verified
* Material recovered
* Estimated CO₂e Avoided
* Customer participation
* Circular marketplace activity

## Important distinction

```text
Waste Collected
≠
Waste Recycled
```

Jika BuangYuk hanya memiliki bukti pickup/verification, sistem tidak boleh otomatis mengklaim bahwa seluruh material telah recycled.

Data sustainability harus mengikuti tingkat evidensi yang tersedia.

---

# 41. Demo Scenario — "Hari Minggu Ibu Sari"

## Act 1 — Customer

Ibu Sari membuka BuangYuk.

```text
Login
 ↓
Create Pickup
 ↓
Plastic + Paper
 ↓
Upload 2 photos
```

## Act 2 — Pricing

System:

```text
Base Price
× Grade
× Condition
× Region
```

menghasilkan estimasi.

## Act 3 — Matching

Weighted Scoring Engine memilih Collector terbaik.

## Act 4 — Collector

Collector menerima dalam ≤60 detik.

## Act 5 — Tracking

Customer melihat:

```text
Collector → En Route
```

GPS update setiap 5 detik.

## Act 6 — Arrival

Collector memasuki radius 100m.

System:

```text
AUTO ARRIVED
```

## Act 7 — Verification

Collector menimbang sampah.

Jika deviation >50%:

```text
Customer Re-confirmation
```

Jika customer setuju:

```text
Completed
```

## Act 8 — Ecosystem

Hasil:

* Customer receives balance
* Eco Points awarded
* Collector earnings become pending
* Bank Sampah receives settlement workflow
* Estimated CO₂e Avoided updated
* Audit log generated

---

# 42. Technical Architecture

```text
                    ┌─────────────────┐
                    │   Next.js Web   │
                    │ Customer/Admin  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ NestJS Backend  │
                    │ API + Business  │
                    │ Logic + RBAC    │
                    └───────┬─────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
│ Firestore   │      │ Firebase    │      │ Firebase    │
│ Database    │      │ Auth        │      │ Storage     │
└─────────────┘      └─────────────┘      └─────────────┘
       │
       ├──────── Google Maps
       ├──────── FCM
       └──────── Midtrans Sandbox
```

## Architectural Principle

Business logic harus berada di backend.

Frontend bertanggung jawab terhadap:

* presentation
* interaction
* local state
* client validation
* image compression

Backend bertanggung jawab terhadap:

* authorization
* pricing
* matching
* transaction calculation
* state transition
* wallet
* settlement
* fraud rules
* dispute resolution
* audit

---

# 43. Non-Functional Requirements

## Performance

Target:

* common API response <2 sec under prototype load
* tracking update every 5 sec
* UI responsive
* lazy loading for heavy data

## Reliability

* transaction operations idempotent
* payment callbacks idempotent
* retry mechanism
* error logging

## Security

* RBAC
* token validation
* server-side authorization
* secure storage
* audit trail

## Accessibility

Basic WCAG AA principles:

* semantic HTML
* keyboard navigation
* readable contrast
* alt text
* accessible labels

## Responsive

Customer:

**Mobile-first**

Collector:

**Mobile-first**

Bank Sampah:

**Desktop-oriented**

Admin:

**Desktop-oriented**

Visual style:

**Hybrid Clean Modern**

Light interface with:

* Green
* Indigo

---

# 44. Error & Edge Cases

## Collector Timeout

```text
No acceptance within 60 sec
→ Reassign
```

## No Collector

```text
Matching failed
→ retry
→ alternative candidates
→ manual fallback
```

## Bank Capacity Full

```text
Bank A Full
→ Partner Bank B
```

## Customer Absent

```text
15 min grace
→ auto cancel
```

## Weight Deviation

```text
>50%
→ re-confirmation
```

## Payment Failure

```text
Failed
→ retry/mock fallback
```

## GPS Failure

```text
GPS unavailable
→ manual state fallback where permitted
```

## Duplicate Payment Callback

Backend must be idempotent.

## Duplicate Pickup

System should prevent duplicate state transitions through transaction/state validation.

## Dispute

Completed transaction can enter:

```text
DISPUTED
```

without silently rewriting historical transaction data.

---

# 45. Assumption Register

| ID    | Assumption                                         | Status               |
| ----- | -------------------------------------------------- | -------------------- |
| A-001 | Initial market Bandung                             | FINAL                |
| A-002 | Multi-region architecture                          | FINAL                |
| A-003 | Smart Matching is rule-based weighted scoring      | FINAL                |
| A-004 | Collector acceptance timeout 60 sec                | FINAL                |
| A-005 | Near geofence 500m                                 | FINAL                |
| A-006 | Auto Arrived 100m                                  | FINAL                |
| A-007 | Customer absence grace 15 min                      | FINAL                |
| A-008 | Weight deviation threshold 50%                     | FINAL                |
| A-009 | Collector earnings hold 24h                        | FINAL                |
| A-010 | Dispute SLA 24h                                    | FINAL                |
| A-011 | Marketplace commission 10%                         | PROTOTYPE ASSUMPTION |
| A-012 | Platform gross spread 15%                          | PROTOTYPE ASSUMPTION |
| A-013 | Cashout minimum Rp10k                              | FINAL / CONFIGURABLE |
| A-014 | Cashout fee Rp1k                                   | FINAL / CONFIGURABLE |
| A-015 | Bank SaaS tiers                                    | PROTOTYPE ASSUMPTION |
| A-016 | Midtrans Sandbox                                   | FINAL                |
| A-017 | Mock payment fallback                              | FINAL                |
| A-018 | FCM instead of SMS                                 | FINAL                |
| A-019 | Firestore instead of Realtime Database             | FINAL                |
| A-020 | EPA WARM fallback for carbon factors               | FINAL POLICY         |
| A-021 | Carbon value represented as Estimated CO₂e Avoided | FINAL                |
| A-022 | Pricing is region/Bank configurable                | FINAL                |
| A-023 | 5-second tracking                                  | FINAL                |
| A-024 | Leaderboard is Future Scope                        | FINAL                |

---

# 46. Open Questions / TBD

Requirement gathering is complete. Open questions are therefore **non-blocking implementation/data questions**, not requirement gaps.

## Carbon Factors

For material-specific factors:

```text
Indonesia-specific source?
 ├─ Available → use it
 └─ Not available → EPA WARM fallback
```

If neither is defensible:

```text
TBD
```

No invented value.

## Bank Sampah SaaS

Tier structure:

### FREE / BASIC

* Profile
* Material acceptance
* Basic transactions
* Basic dashboard

### PRO

* Advanced analytics
* Export reports
* Advanced operational management
* Higher limits

### ENTERPRISE / PARTNER

* Advanced analytics
* Multi-location
* Custom reporting
* Dedicated support/integration

Subscription amount remains:

**TBD / Configurable**

Real billing is Future Scope.

## Commission

Prototype:

```text
Marketplace = 10%
Waste platform gross spread = 15%
```

Both configurable.

---

# 47. Acceptance Criteria

## Authentication

* [ ] Customer can login using Google OAuth.
* [ ] User receives correct role.
* [ ] Unauthorized role cannot access restricted resources.

## Pickup

* [ ] Customer can create pickup.
* [ ] Two photos are required.
* [ ] Pricing is calculated dynamically.
* [ ] Pickup enters REQUESTED state.

## Matching

* [ ] Weighted Scoring Engine ranks eligible Collectors.
* [ ] Configurable weights are used.
* [ ] Collector has 60 seconds.
* [ ] Timeout triggers reassignment.

## Tracking

* [ ] Collector location updates approximately every 5 seconds.
* [ ] Customer sees Collector position.
* [ ] Timestamp is validated.

## Geofencing

* [ ] ≤500m produces Near state.
* [ ] ≤100m can produce Auto Arrived.
* [ ] Manual fallback exists.

## Verification

* [ ] Collector can submit actual weight.
* [ ] Customer can confirm.
* [ ] >50% deviation requires explicit reconfirmation.

## Customer Absence

* [ ] 15-minute grace period is enforced.
* [ ] Timeout can auto-cancel.

## Wallet

* [ ] Customer balance is separate from Eco Points.
* [ ] Minimum cashout is configurable.
* [ ] Fee is configurable.
* [ ] Eco Points cannot be withdrawn as cash.

## Collector Earnings

* [ ] Earnings initially become Pending.
* [ ] 24-hour hold is enforced.
* [ ] Earnings become Available after hold.

## Bank Sampah

* [ ] Capacity can be configured.
* [ ] Full capacity triggers fallback.
* [ ] Settlement records exist.

## Marketplace

* [ ] Customer can browse products.
* [ ] Customer can checkout.
* [ ] Mock payment works.
* [ ] Order follows required lifecycle.
* [ ] 10% prototype commission is configurable.
* [ ] Shipping fee is separate.

## Carbon

* [ ] Material factor has source metadata.
* [ ] Unknown factor displays TBD.
* [ ] UI uses Estimated CO₂e Avoided.
* [ ] No unsupported absolute emissions claim is displayed.

## Dispute

* [ ] Customer can open dispute.
* [ ] Seven categories are supported.
* [ ] Admin can review.
* [ ] Resolution is audited.

## Fraud

* [ ] Rule-based flags can be generated.
* [ ] Admin can review.
* [ ] Admin decision is final.
* [ ] Audit event is created.

## Audit

* [ ] Sensitive actions create immutable audit records.
* [ ] Client cannot modify audit history.

---

# 48. Requirement Traceability / Coverage Matrix

The following traceability structure preserves the finalized requirements and connects them to implementation areas.

| ID    | Final Requirement                    | Primary Module  | Priority |
| ----- | ------------------------------------ | --------------- | -------- |
| R-001 | Hybrid Business Model                | Business        | P0       |
| R-002 | Bandung → Nasional                   | Multi-region    | P0       |
| R-003 | 5-role E2E Demo                      | RBAC/Demo       | P0       |
| R-004 | Weighted Scoring Engine              | Matching        | P0       |
| R-005 | Collector Acceptance 60 sec          | Pickup          | P0       |
| R-006 | Dynamic Waste Pricing                | Pricing         | P0       |
| R-007 | 8-state Pickup Machine               | Pickup          | P0       |
| R-008 | Cancellation Policy                  | Pickup          | P0       |
| R-009 | Waste Verification                   | Verification    | P0       |
| R-010 | >50% Weight Deviation                | Verification    | P0       |
| R-011 | 15-min Customer Grace                | Pickup          | P0       |
| R-012 | 7-category Dispute Lifecycle         | Dispute         | P0       |
| R-013 | 500m/100m Geofencing                 | Maps            | P0       |
| R-014 | 2-photo Proof of Waste               | Storage         | P0       |
| R-015 | 5-sec Realtime Tracking              | Tracking        | P0       |
| R-016 | Google Maps                          | Maps            | P0       |
| R-017 | FCM + In-App                         | Notification    | P0       |
| R-018 | Firebase Storage                     | Storage         | P0       |
| R-019 | 6-digit PIN + Mock OTP               | Auth            | P0       |
| R-020 | Midtrans + Mock                      | Payment         | P0       |
| R-021 | Cloud Firestore                      | Database        | P0       |
| R-022 | SearchService                        | Search          | P0       |
| R-023 | Offline Persistence                  | Client/Data     | P0       |
| R-024 | Immutable Audit Log                  | Audit           | P0       |
| R-025 | Hybrid Clean Modern Visual           | UI/UX           | P0       |
| R-026 | Responsive Design                    | UI/UX           | P0       |
| R-027 | Hari Minggu Ibu Sari                 | Demo            | P0       |
| R-028 | Full Circular Ecosystem              | ESG             | P0       |
| R-029 | Basic Accessibility                  | UI/UX           | P0       |
| R-030 | Carbon Impact Visualization          | ESG             | P0       |
| R-031 | Collector Earnings                   | Earnings        | P0       |
| R-032 | Bank Sampah Settlement               | Settlement      | P0       |
| R-033 | Wallet Architecture                  | Wallet          | P0       |
| R-034 | RBAC Permission Matrix               | Security        | P0       |
| R-035 | Collector Reliability Score          | Collector       | P0       |
| R-036 | Bank Sampah Capacity                 | Bank Operations | P0       |
| R-037 | Marketplace Lifecycle                | Marketplace     | P0       |
| R-038 | Rule-Based Fraud Detection           | Fraud           | P0       |
| R-039 | Collector Earnings Hold              | Earnings        | P0       |
| R-040 | Customer Pickup Creation             | Pickup          | P0       |
| R-041 | Customer Confirmation                | Verification    | P0       |
| R-042 | Automatic Reassignment               | Matching        | P0       |
| R-043 | Manual Geofence Fallback             | Maps            | P0       |
| R-044 | Dynamic Region Configuration         | Pricing         | P0       |
| R-045 | Pricing Snapshot                     | Transaction     | P0       |
| R-046 | Collector Reliability Thresholds     | Collector       | P0       |
| R-047 | Pro-customer Auto Resolution         | Dispute         | P0       |
| R-048 | Admin Arbitration                    | Dispute         | P0       |
| R-049 | Platform Intermediary Model          | Settlement      | P0       |
| R-050 | Gross Spread Accounting              | Finance         | P0       |
| R-051 | Revenue Separation                   | Finance         | P0       |
| R-052 | Gross Margin Separation              | Finance         | P0       |
| R-053 | Operational Cost Separation          | Finance         | P0       |
| R-054 | Contribution Margin                  | Finance         | P0       |
| R-055 | Configurable Marketplace Commission  | Marketplace     | P0       |
| R-056 | Configurable Platform Spread         | Finance         | P0       |
| R-057 | Bank SaaS Tier Structure             | SaaS            | P0       |
| R-058 | No MVP SaaS Billing                  | SaaS            | P0       |
| R-059 | Carbon Factor Metadata               | ESG             | P0       |
| R-060 | Indonesia Source Priority            | ESG             | P0       |
| R-061 | EPA WARM Fallback                    | ESG             | P0       |
| R-062 | TBD When Factor Missing              | ESG             | P0       |
| R-063 | Estimated CO₂e Avoided Terminology   | ESG             | P0       |
| R-064 | No AI/ML Matching Claim              | Matching        | P0       |
| R-065 | No AI/ML Fraud Claim                 | Fraud           | P0       |
| R-066 | Mock/Sandbox Integration Boundary    | Integration     | P0       |
| R-067 | Production vs Demo Separation        | Architecture    | P0       |
| R-068 | Multi-region Architecture from Start | Architecture    | P0       |

---

# FINAL PRODUCT DECISION

## Status

**REQUIREMENT GATHERING: COMPLETE**

**PRD BASIS: APPROVED**

Tidak ada perubahan terhadap requirement final.

## Classification

### FINAL REQUIREMENT

Semua requirement P0 yang telah disepakati pada Batch 1–8.

### PROTOTYPE ASSUMPTION

* Marketplace commission: **10%**
* Waste transaction gross spread: **15%**
* Bank Sampah SaaS tier structure
* Nominal subscription belum dikunci

### TBD

* Material-specific Indonesia emission factors yang belum memiliki sumber valid.
* Subscription nominal.
* Material/pathway carbon factor yang belum tersedia secara defensible.

### FUTURE SCOPE

Semua fitur AI/ML, native mobile, real e-wallet, real shipping API, real OTP, escrow, blockchain, IoT, chat, leaderboard, advanced analytics, dan fitur lain yang telah didefinisikan sebagai Future Scope.

---

# PRD IMPLEMENTATION PRINCIPLES

Developer harus mempertahankan prinsip berikut:

1. **Business rules berada di backend.**
2. **Sensitive fields tidak dapat ditulis langsung oleh client.**
3. **Semua konfigurasi penting dapat diubah Admin tanpa mengubah source code.**
4. **Historical transaction menyimpan configuration snapshot.**
5. **Weighted Scoring Engine bukan AI/ML.**
6. **Rule-Based Fraud Detection bukan AI/ML.**
7. **Harga sampah bukan harga nasional.**
8. **Region merupakan bagian dari architecture sejak awal.**
9. **Midtrans pada MVP adalah Sandbox.**
10. **Payment fallback adalah Mock.**
11. **Shipping pada MVP adalah Mock.**
12. **Eco Points bukan uang tunai.**
13. **Audit log bersifat append-only.**
14. **State transition harus tervalidasi server-side.**
15. **Carbon metric menggunakan Estimated CO₂e Avoided.**
16. **Jika data carbon factor tidak tersedia, gunakan TBD.**
17. **Fitur Future Scope tidak boleh dipresentasikan sebagai MVP.**
18. **Demo harus mampu menunjukkan kelima role dalam satu ecosystem.**
19. **Automation harus mengikuti prinsip ride-hailing: request → matching → acceptance → tracking → arrival → verification → settlement.**
20. **Arsitektur harus memungkinkan ekspansi Bandung → Nasional tanpa redesign fundamental.**

---

# DEVELOPMENT READINESS

Dengan PRD ini, tim development sudah dapat memulai:

```text
PRD
 ↓
System Architecture
 ↓
Firestore Schema
 ↓
API Contract
 ↓
RBAC Rules
 ↓
Backend Modules
 ↓
Frontend Information Architecture
 ↓
UI/UX Design
 ↓
Implementation
 ↓
Integration Testing
 ↓
End-to-End Demo
```

**BuangYuk PRD v1.0 — READY FOR DESIGN & DEVELOPMENT.**

[1]: https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P101982A.txt&utm_source=chatgpt.com "Documentation for Greenhouse Gas Emission and Energy Factors Used in the Waste Reduction Model (WARM) Management Practices Chapters"
[2]: https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P1019375.txt&utm_source=chatgpt.com "Using WARM Emission Factors for Materials and Pathways Not in WARM"
