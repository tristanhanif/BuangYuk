# Metodologi Kalkulasi Carbon Footprint - BuangYuk

## 1. Dasar Teori

### 1.1 EPA WARM (Waste Reduction Model)
Model standar EPA untuk menghitung pengurangan emisi gas rumah kaca (GHG) dari pengelolaan limbah. Metode ini menghitung **emisi terhindar** (avoided emissions) dari:
- **Penghindaran pembuatan bahan baru** (virgin material production)
- **Penghindaran pembuangan di TPA** (landfill methane avoidance)
- **Penghematan energi** dari proses daur ulang

### 1.2 Rumus Dasar

```
CO₂e Saved (kg) = Weight (kg) × Emission Factor (kg CO₂e/kg material)
```

Di mana **Emission Factor** = Net emission reduction per kg material recycled vs landfilled.

---

## 2. Emission Factors per Kategori (Sumber: EPA WARM v15, IPCC 2006)

| Kategori | Kode | Emission Factor (kg CO₂e/kg) | Sumber |
|----------|------|------------------------------|--------|
| Kertas & Karton | `paper-cardboard` | **3.10** | EPA WARM - Mixed Paper |
| Plastik PET (Botol) | `plastic-pet` | **2.10** | EPA WARM - PET |
| Plastik HDPE (Botol) | `plastic-hdpe` | **1.80** | EPA WARM - HDPE |
| Plastik PP | `plastic-pp` | **1.70** | EPA WARM - PP |
| Plastik LDPE | `plastic-ldpe` | **1.60** | EPA WARM - LDPE |
| Plastik Campuran | `plastic-mixed` | **1.50** | EPA WARM - Mixed Plastics |
| Logam Aluminium | `metal-aluminum` | **8.90** | EPA WARM - Aluminum Cans |
| Logam Besi/Baja | `metal-steel` | **1.80** | EPA WARM - Steel Cans |
| Logam Campuran | `metal-mixed` | **2.50** | EPA WARM - Mixed Metals |
| Kaca | `glass` | **0.30** | EPA WARM - Glass |
| E-Waste (Umum) | `ewaste-general` | **1.20** | EPA WARM - Electronics |
| CPU/Processor | `ewaste-cpu` | **2.50** | EPA WARM - Desktop CPU |
| Layar/Monitor | `ewaste-screen` | **1.50** | EPA WARM - CRT/LCD |
| Kabel | `ewaste-cable` | **1.80** | EPA WARM - Cables |
| Baterai | `ewaste-battery` | **3.00** | EPA WARM - Batteries |
| Organik (Kompos) | `organic` | **0.20** | IPCC 2006 - Composting |
| Tetrapak | `tetrapak` | **1.20** | EPA WARM - Aseptic Cartons |
| Tekstil | `textile` | **2.30** | EPA WARM - Mixed Textiles |

> **Catatan**: Faktor di atas adalah **net emission reduction** (daur ulang vs TPA). Sudah termasuk credit untuk menghindari produksi bahan baru dan menghindari emisi metana di TPA.

---

## 3. Implementasi di Codebase

### 3.1 Konstanta (`src/lib/constants.ts`)

```typescript
export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: "paper-cardboard",
    label: "Kertas & Karton",
    icon: "📄",
    unit: "kg",
    pricePerKg: 2500,
    co2Factor: 3.10,  // kg CO₂e per kg
    pointsPerKg: 10,
  },
  // ... kategori lain
];
```

### 3.2 Fungsi Kalkulasi (`src/lib/utils.ts`)

```typescript
export function calculateCO2Saved(categoryId: string, weightKg: number): number {
  const category = WASTE_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return 0;
  return weightKg * category.co2Factor;
}

export function calculateEarnings(categoryId: string, weightKg: number): number {
  const category = WASTE_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return 0;
  return Math.round(weightKg * category.pricePerKg);
}

export function calculatePoints(categoryId: string, weightKg: number): number {
  const category = WASTE_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return 0;
  return Math.round(weightKg * category.pointsPerKg);
}
```

### 3.3 Normalisasi Satuan (`src/lib/constants.ts`)

```typescript
export const UNIT_CONVERSIONS: Record<string, { toKg: number; fromKg: number }> = {
  kg: { toKg: 1, fromKg: 1 },
  pcs: { toKg: 1, fromKg: 1 },  // Default, overridden per category
};

// Per kategori (contoh):
// 1 botol PET 600ml ≈ 0.025 kg
// 1 kg kertas ≈ 200 lembar A4
```

---

## 4. Contoh Perhitungan Nyata

### Case 1: User setor 5 kg Kertas & Karton
```
Weight: 5 kg
Emission Factor: 3.10 kg CO₂e/kg
CO₂e Saved = 5 × 3.10 = 15.5 kg CO₂e
Earnings = 5 × 2.500 = Rp 12.500
Points = 5 × 10 = 50 pts
```

### Case 2: User setor 10 botol PET (600ml)
```
Quantity: 10 pcs
Unit Conversion: 1 pcs = 0.025 kg
Weight = 10 × 0.025 = 0.25 kg
Emission Factor: 2.10 kg CO₂e/kg
CO₂e Saved = 0.25 × 2.10 = 0.525 kg CO₂e
Earnings = 0.25 × 5.000 = Rp 1.250
Points = 0.25 × 15 = 4 pts (dibulatkan)
```

### Case 3: User setor 2 kg Aluminium
```
Weight: 2 kg
Emission Factor: 8.90 kg CO₂e/kg
CO₂e Saved = 2 × 8.90 = 17.8 kg CO₂e
Earnings = 2 × 15.000 = Rp 30.000
Points = 2 × 50 = 100 pts
```

---

## 5. Verifikasi Ulang (Petugas)

Di halaman verifikasi (`src/app/(verifier)/verifikasi/[id]/page.tsx`):

1. Petugas timbang fisik → dapat **Actual Weight**
2. Sistem hitung **selisih %** = `|actual - estimated| / estimated × 100%`
3. Jika selisih ≤ 10% → **COMPLETED** (langsung final)
4. Jika selisih > 10% → **VERIFIED** (hitung ulang proporsional per item)

```typescript
// Recalculation berbasis proporsi per item
transaction.items.forEach(item => {
  const ratio = item.weightKg / transaction.totalWeightKg;
  const itemVerifiedWeight = actualWeight * ratio;
  verifiedEarnings += calculateEarnings(item.categoryId, itemVerifiedWeight);
  verifiedCO2 += calculateCO2Saved(item.categoryId, itemVerifiedWeight);
  verifiedPoints += calculatePoints(item.categoryId, itemVerifiedWeight);
});
```

---

## 6. Comparator untuk Visualisasi (Arts/Gamifikasi)

Untuk konteks pengguna non-teknis:

| 1 kg CO₂e ≈ | Konteks |
|-------------|---------|
| **0.045 pohon** | 1 pohon dewasa serap ~22 kg CO₂/th |
| **0.42 kWh listrik** | PLN grid emission ~2.38 kg CO₂/kWh |
| **0.45 km mobil** | Mobil bensin ~2.2 kg CO₂/km |
| **0.15 liter bensin** | 1 L bensin ~2.3 kg CO₂ |

Contoh: 15.5 kg CO₂e (5 kg kertas) ≈ **345 pohon-hari** atau **6,5 kWh listrik** atau **7 km naik mobil**

---

## 7. Referensi

1. **EPA WARM Model v15** - https://www.epa.gov/warm
2. **IPCC 2006 Guidelines** - Volume 5: Waste
3. **Indonesia NDC 2022** - Waste sector mitigation
4. **KLHK RI** - Pedoman Penghitungan GRK Sektor Limbah

---

## 8. Catatan untuk Pengembangan Lanjut

- [ ] Tambah emission factor untuk kategori spesifik Indonesia (misal: plastik sachet)
- [ ] Validasi density check di verifikasi (volume vs berat)
- [ ] Integrasi MRV (Measurement, Reporting, Verification) untuk carbon credit
- [ ] Life Cycle Assessment (LCA) per kategori untuk akurasi lebih tinggi