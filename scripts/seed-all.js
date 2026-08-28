/**
 * Comprehensive Seed Script for BuangYuk
 * Based on update.md PRD v1.0
 *
 * Seeds: users, collectors, waste_banks, regions, materials,
 * pricing_configs, carbon_factors, matching_configs, system_configs
 *
 * Usage: node scripts/seed-all.js
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, "..", "backend", "serviceAccountKey.json"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

async function seedAll() {
  console.log("🌱 Starting comprehensive seed (update.md)...\n");

  try {
    await seedRegions();
    await seedMaterials();
    await seedCarbonFactors();
    await seedPricingConfigs();
    await seedMatchingConfig();
    await seedCommissionConfig();
    await seedWasteBanks();

    console.log("\n✅ All seed data created successfully!");
  } catch (error) {
    console.error("❌ Error seeding:", error);
  }

  process.exit(0);
}

async function seedRegions() {
  console.log("📍 Seeding regions...");
  const regions = [
    { id: "bandung", name: "Bandung", province: "Jawa Barat", city: "Bandung", country: "Indonesia", isActive: true },
    { id: "bandung-kota", name: "Bandung Kota", province: "Jawa Barat", city: "Bandung", country: "Indonesia", isActive: true },
    { id: "bandung-barat", name: "Bandung Barat", province: "Jawa Barat", city: "Bandung Barat", country: "Indonesia", isActive: true },
    { id: "jabar", name: "Jawa Barat", province: "Jawa Barat", city: "Multi-City", country: "Indonesia", isActive: true },
  ];

  for (const region of regions) {
    await db.collection("regions").doc(region.id).set(region);
  }
  console.log(`  ✓ ${regions.length} regions`);
}

async function seedMaterials() {
  console.log("♻️  Seeding materials (waste_categories)...");
  const materials = [
    { id: "kertas", categoryGroup: "Kertas & Karton", materialName: "Kertas", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 3.3, basePricePerKg: 2000, hazardousFlag: false, isActive: true },
    { id: "karton", categoryGroup: "Kertas & Karton", materialName: "Karton", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 3.3, basePricePerKg: 1800, hazardousFlag: false, isActive: true },
    { id: "plastik-pet", categoryGroup: "Plastik", materialName: "Plastik PET", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 2.5, basePricePerKg: 4000, hazardousFlag: false, isActive: true },
    { id: "plastik-hdpe", categoryGroup: "Plastik", materialName: "Plastik HDPE", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.8, basePricePerKg: 5000, hazardousFlag: false, isActive: true },
    { id: "plastik-pp", categoryGroup: "Plastik", materialName: "Plastik PP", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.8, basePricePerKg: 3500, hazardousFlag: false, isActive: true },
    { id: "plastik-ldpe", categoryGroup: "Plastik", materialName: "Plastik LDPE", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.8, basePricePerKg: 2500, hazardousFlag: false, isActive: true },
    { id: "plastik-campur", categoryGroup: "Plastik", materialName: "Plastik Campur", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.5, basePricePerKg: 1500, hazardousFlag: false, isActive: true },
    { id: "logam-aluminium", categoryGroup: "Logam", materialName: "Aluminium", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 8.8, basePricePerKg: 15000, hazardousFlag: false, isActive: true },
    { id: "logam-besi", categoryGroup: "Logam", materialName: "Besi & Baja", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.7, basePricePerKg: 3000, hazardousFlag: false, isActive: true },
    { id: "kaca", categoryGroup: "Kaca", materialName: "Kaca", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 0.3, basePricePerKg: 500, hazardousFlag: false, isActive: true },
    { id: "e-waste-portabel", categoryGroup: "E-Waste", materialName: "E-Waste Portabel", unitType: "pcs", conversionFactorToKg: 0.1, emissionSavingFactor: 1.2, basePricePerKg: 25000, hazardousFlag: true, isActive: true },
    { id: "cpu", categoryGroup: "E-Waste", materialName: "CPU / Komputer", unitType: "pcs", conversionFactorToKg: 5.0, emissionSavingFactor: 1.5, basePricePerKg: 50000, hazardousFlag: true, isActive: true },
    { id: "layar", categoryGroup: "E-Waste", materialName: "Layar / Monitor", unitType: "pcs", conversionFactorToKg: 3.0, emissionSavingFactor: 0.8, basePricePerKg: 30000, hazardousFlag: true, isActive: true },
    { id: "kabel", categoryGroup: "E-Waste", materialName: "Kabel & Aksesoris", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 2.1, basePricePerKg: 20000, hazardousFlag: false, isActive: true },
    { id: "baterai", categoryGroup: "E-Waste", materialName: "Baterai", unitType: "pcs", conversionFactorToKg: 0.1, emissionSavingFactor: 4.5, basePricePerKg: 10000, hazardousFlag: true, isActive: true },
  ];

  for (const material of materials) {
    await db.collection("waste_categories").doc(material.id).set(material);
  }
  console.log(`  ✓ ${materials.length} materials (waste_categories)`);
}

async function seedCarbonFactors() {
  console.log("🌍 Seeding carbon_factors (update.md 29.23)...");
  const factors = [
    { id: "kertas", material: "kertas", emissionFactor: 3.3, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "karton", material: "karton", emissionFactor: 3.3, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "plastik-pet", material: "plastik-pet", emissionFactor: 2.5, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "plastik-hdpe", material: "plastik-hdpe", emissionFactor: 1.8, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "plastik-pp", material: "plastik-pp", emissionFactor: 1.8, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "plastik-ldpe", material: "plastik-ldpe", emissionFactor: 1.8, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "plastik-campur", material: "plastik-campur", emissionFactor: 1.5, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Proxy estimation", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "low", confidence: "Low - mixed plastic proxy", isActive: true },
    { id: "logam-aluminium", material: "logam-aluminium", emissionFactor: 8.8, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "logam-besi", material: "logam-besi", emissionFactor: 1.7, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "kaca", material: "kaca", emissionFactor: 0.3, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "e-waste-portabel", material: "e-waste-portabel", emissionFactor: 1.2, unit: "kg CO2e/pcs", source: "EPA WARM v16", methodology: "Proxy estimation", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "low", confidence: "Low - proxy estimation", isActive: true },
    { id: "cpu", material: "cpu", emissionFactor: 1.5, unit: "kg CO2e/pcs", source: "EPA WARM v16", methodology: "Proxy estimation", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "low", confidence: "Low - proxy estimation", isActive: true },
    { id: "layar", material: "layar", emissionFactor: 0.8, unit: "kg CO2e/pcs", source: "EPA WARM v16", methodology: "Proxy estimation", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "low", confidence: "Low - proxy estimation", isActive: true },
    { id: "kabel", material: "kabel", emissionFactor: 2.1, unit: "kg CO2e/kg", source: "EPA WARM v16", methodology: "Lifecycle comparison", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "medium", confidence: "Medium - proxy from US data", isActive: true },
    { id: "baterai", material: "baterai", emissionFactor: 4.5, unit: "kg CO2e/pcs", source: "EPA WARM v16", methodology: "Proxy estimation", version: "16", effectiveDate: new Date("2024-01-01"), lastUpdated: new Date(), dataQuality: "low", confidence: "Low - proxy estimation", isActive: true },
  ];

  for (const factor of factors) {
    await db.collection("carbon_factors").doc(factor.id).set(factor);
  }
  console.log(`  ✓ ${factors.length} carbon_factors`);
}

async function seedPricingConfigs() {
  console.log("💰 Seeding pricing_configs (update.md 29.21)...");
  const materials = [
    "kertas", "karton", "plastik-pet", "plastik-hdpe", "plastik-pp",
    "plastik-ldpe", "plastik-campur", "logam-aluminium", "logam-besi",
    "kaca", "e-waste-portabel", "cpu", "layar", "kabel", "baterai",
  ];

  const basePrices = {
    "kertas": 2000, "karton": 1800, "plastik-pet": 4000, "plastik-hdpe": 5000,
    "plastik-pp": 3500, "plastik-ldpe": 2500, "plastik-campur": 1500,
    "logam-aluminium": 15000, "logam-besi": 3000, "kaca": 500,
    "e-waste-portabel": 25000, "cpu": 50000, "layar": 30000,
    "kabel": 20000, "baterai": 10000,
  };

  const gradeFactors = { A: 1.0, B: 0.8, C: 0.6, D: 0.4 };
  const conditionFactors = { clean: 1.0, mixed: 0.85, dirty: 0.7 };

  for (const materialId of materials) {
    const configId = `${materialId}-bandung`;
    await db.collection("pricing_configs").doc(configId).set({
      configId,
      regionId: "bandung",
      materialId,
      basePrice: basePrices[materialId] || 1000,
      gradeFactors,
      conditionFactors,
      regionFactor: 1.0,
      effectiveFrom: new Date(),
      effectiveUntil: null,
      isActive: true,
      updatedBy: "system",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  console.log(`  ✓ ${materials.length} pricing_configs`);
}

async function seedMatchingConfig() {
  console.log("🔗 Seeding matching_configs (update.md 29.22)...");
  await db.collection("matching_configs").doc("default").set({
    configId: "default",
    distanceWeight: 25,
    reliabilityWeight: 25,
    availabilityWeight: 15,
    capacityWeight: 15,
    acceptanceWeight: 10,
    otherWeight: 10,
    acceptanceTimeoutSeconds: 60,
    nearRadiusMeters: 500,
    arrivedRadiusMeters: 100,
    isActive: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("  ✓ matching_configs");
}

async function seedCommissionConfig() {
  console.log("⚙️  Seeding system configs...");
  await db.collection("configs").doc("commission").set({
    marketplaceCommissionRate: 0.10,
    platformGrossSpread: 0.15,
    collectorBaseFee: 5000,
    collectorCommissionRate: 0.05,
    cashoutMinimum: 10000,
    cashoutFee: 1000,
    paymentFeeRate: 0.029,
    customerAbsenceGraceMinutes: 15,
    weightDeviationThresholdPercent: 50,
    disputeSLAHours: 24,
    collectorEarningsHoldHours: 24,
    marketplaceAutoCompleteDays: 3,
    cancellationPenaltyEnabled: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("  ✓ system configs");
}

async function seedWasteBanks() {
  console.log("🏦 Seeding waste_banks (update.md 29.11)...");
  const banks = [
    {
      bankId: "bank-bandung-01",
      name: "Bank Sampah Mandiri Bandung",
      regionId: "bandung",
      address: "Jl. Lingkungan No. 1, Bandung",
      location: { lat: -6.9175, lng: 107.6191 },
      acceptedMaterials: ["kertas", "plastik-pet", "plastik-hdpe", "logam-aluminium", "logam-besi", "kaca"],
      dailyCapacityKg: 500,
      usedCapacityKg: 0,
      operationalStatus: "active",
      pricingConfigId: null,
      contactInfo: { phone: "+62 22 XXXX XXXX", email: "info@bsm-bandung.id" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      bankId: "bank-bandung-02",
      name: "Bank Sampah Hijau Lestari",
      regionId: "bandung",
      address: "Jl. Daur Ulang No. 42, Bandung",
      location: { lat: -6.9059, lng: 107.6131 },
      acceptedMaterials: ["kertas", "karton", "plastik-campur", "e-waste-portabel"],
      dailyCapacityKg: 300,
      usedCapacityKg: 0,
      operationalStatus: "active",
      pricingConfigId: null,
      contactInfo: { phone: "+62 22 YYYY YYYY", email: "info@hijau-lestari.id" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const bank of banks) {
    await db.collection("waste_banks").doc(bank.bankId).set(bank);
  }
  console.log(`  ✓ ${banks.length} waste_banks`);
}

seedAll();
