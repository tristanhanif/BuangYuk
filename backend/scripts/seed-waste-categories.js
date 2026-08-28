/**
 * Seed Script: waste_categories Collection
 * 
 * Run: npm run db:seed-categories (from ./backend)
 * 
 * Requires: FIREBASE_SERVICE_ACCOUNT env var (path to service account JSON)
 * Or: Set GOOGLE_APPLICATION_CREDENTIALS env var
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const WASTE_CATEGORIES = [
  // ============================================================
  // KERTAS & KARTON
  // ============================================================
  {
    id: "paper_cardboard",
    categoryGroup: "Kertas",
    materialName: "Kardus Gelombang",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 3.3,
    basePricePerKg: 2000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "paper_newsprint",
    categoryGroup: "Kertas",
    materialName: "Kertas Koran",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 3.3,
    basePricePerKg: 1800,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "paper_mixed",
    categoryGroup: "Kertas",
    materialName: "Kertas Campur",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 3.0,
    basePricePerKg: 1500,
    hazardousFlag: false,
    isActive: true,
  },

  // ============================================================
  // PLASTIK
  // ============================================================
  {
    id: "plastic_pet",
    categoryGroup: "Plastik",
    materialName: "PET (Botol Minuman)",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 2.5,
    basePricePerKg: 4000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "plastic_hdpe",
    categoryGroup: "Plastik",
    materialName: "HDPE (Galon, Jerigen)",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 1.8,
    basePricePerKg: 5000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "plastic_pp",
    categoryGroup: "Plastik",
    materialName: "PP (Tutup Botol, Wadah Makanan)",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 1.8,
    basePricePerKg: 3500,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "plastic_ldpe",
    categoryGroup: "Plastik",
    materialName: "LDPE (Kantong Kresek, Wrap)",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 1.8,
    basePricePerKg: 2500,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "plastic_mixed",
    categoryGroup: "Plastik",
    materialName: "Plastik Campur",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 1.5,
    basePricePerKg: 1500,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "plastic_styrofoam",
    categoryGroup: "Plastik",
    materialName: "Styrofoam",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 1.2,
    basePricePerKg: 500,
    hazardousFlag: false,
    isActive: true,
  },

  // ============================================================
  // LOGAM
  // ============================================================
  {
    id: "metal_aluminum",
    categoryGroup: "Logam",
    materialName: "Aluminium (Kaleng Minuman)",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 8.8,
    basePricePerKg: 15000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "metal_iron",
    categoryGroup: "Logam",
    materialName: "Besi & Baja",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 1.7,
    basePricePerKg: 3000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "metal_copper",
    categoryGroup: "Logam",
    materialName: "Tembaga",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 3.5,
    basePricePerKg: 50000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "metal_brass",
    categoryGroup: "Logam",
    materialName: "Kuningan",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 2.0,
    basePricePerKg: 25000,
    hazardousFlag: false,
    isActive: true,
  },

  // ============================================================
  // KACA
  // ============================================================
  {
    id: "glass_clear",
    categoryGroup: "Kaca",
    materialName: "Kaca Bening (Botol)",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 0.3,
    basePricePerKg: 500,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "glass_colored",
    categoryGroup: "Kaca",
    materialName: "Kaca Berwarna",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 0.3,
    basePricePerKg: 400,
    hazardousFlag: false,
    isActive: true,
  },

  // ============================================================
  // E-WASTE
  // ============================================================
  {
    id: "ewaste_mobile",
    categoryGroup: "E-Waste",
    materialName: "Ponsel / Tablet",
    unitType: "pcs",
    conversionFactorToKg: 0.15,
    emissionSavingFactor: 1.2,
    basePricePerKg: 25000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "ewaste_laptop",
    categoryGroup: "E-Waste",
    materialName: "Laptop",
    unitType: "pcs",
    conversionFactorToKg: 2.0,
    emissionSavingFactor: 1.5,
    basePricePerKg: 30000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "ewaste_cpu",
    categoryGroup: "E-Waste",
    materialName: "CPU / Komputer Desktop",
    unitType: "pcs",
    conversionFactorToKg: 8.0,
    emissionSavingFactor: 1.5,
    basePricePerKg: 50000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "ewaste_monitor",
    categoryGroup: "E-Waste",
    materialName: "Monitor / TV",
    unitType: "pcs",
    conversionFactorToKg: 5.0,
    emissionSavingFactor: 0.8,
    basePricePerKg: 30000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "ewaste_printer",
    categoryGroup: "E-Waste",
    materialName: "Printer / Scanner",
    unitType: "pcs",
    conversionFactorToKg: 3.0,
    emissionSavingFactor: 1.0,
    basePricePerKg: 15000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "ewaste_cable",
    categoryGroup: "E-Waste",
    materialName: "Kabel & Aksesoris",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 2.1,
    basePricePerKg: 20000,
    hazardousFlag: false,
    isActive: true,
  },

  // ============================================================
  // BATERAI & B3
  // ============================================================
  {
    id: "battery_alkaline",
    categoryGroup: "Baterai",
    materialName: "Baterai Alkaline",
    unitType: "pcs",
    conversionFactorToKg: 0.05,
    emissionSavingFactor: 4.5,
    basePricePerKg: 10000,
    hazardousFlag: true,
    isActive: true,
  },
  {
    id: "battery_lithium",
    categoryGroup: "Baterai",
    materialName: "Baterai Lithium / Li-ion",
    unitType: "pcs",
    conversionFactorToKg: 0.1,
    emissionSavingFactor: 5.0,
    basePricePerKg: 15000,
    hazardousFlag: true,
    isActive: true,
  },
  {
    id: "battery_lead_acid",
    categoryGroup: "Baterai",
    materialName: "Aki / Lead-Acid Battery",
    unitType: "pcs",
    conversionFactorToKg: 10.0,
    emissionSavingFactor: 3.8,
    basePricePerKg: 8000,
    hazardousFlag: true,
    isActive: true,
  },

  // ============================================================
  // LAINNYA
  // ============================================================
  {
    id: "textile",
    categoryGroup: "Tekstil",
    materialName: "Pakaian / Kain Bekas",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 2.0,
    basePricePerKg: 1000,
    hazardousFlag: false,
    isActive: true,
  },
  {
    id: "organic_compost",
    categoryGroup: "Organik",
    materialName: "Sampah Organik (Kompos)",
    unitType: "kg",
    conversionFactorToKg: 1.0,
    emissionSavingFactor: 0.5,
    basePricePerKg: 200,
    hazardousFlag: false,
    isActive: true,
  },
];

async function seedWasteCategories() {
  console.log("🌱 Starting seed: waste_categories...\n");

  const batch = db.batch();
  let count = 0;

  for (const category of WASTE_CATEGORIES) {
    const docRef = db.collection("waste_categories").doc(category.id);
    batch.set(docRef, {
      ...category,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
    console.log(`  ✅ ${category.id}: ${category.materialName} (${category.categoryGroup})`);
  }

  console.log(`\n📦 Committing ${count} categories...`);
  await batch.commit();
  console.log(`\n🎉 Successfully seeded ${count} waste categories!`);
}

async function seedUserEcoSummary(userId) {
  console.log(`\n🌱 Creating eco summary for user: ${userId}...`);

  await db.collection("user_eco_summaries").doc(userId).set({
    userId,
    totalVerifiedWeightKg: 0,
    totalCo2eSavedKg: 0,
    totalEcoPoints: 0,
    totalCashEarned: 0,
    badgeLevel: "Pemula Hijau",
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ Eco summary created for ${userId}`);
}

// Run the seed
async function main() {
  try {
    await seedWasteCategories();

    // If a userId is provided, also create their eco summary
    const userId = process.argv[2];
    if (userId) {
      await seedUserEcoSummary(userId);
    }

    console.log("\n✨ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
