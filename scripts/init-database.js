/**
 * Database Initialization Script for BuangYuk
 * 
 * This script initializes the Firestore database with:
 * 1. Waste categories (master data)
 * 2. Initial admin user (optional)
 * 3. Database structure verification
 * 
 * Run: node scripts/init-database.js [admin-email]
 * 
 * Requires: FIREBASE_SERVICE_ACCOUNT env var or GOOGLE_APPLICATION_CREDENTIALS
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ============================================================
// Waste Categories Seed Data
// ============================================================
const WASTE_CATEGORIES = [
  { id: "paper_cardboard", categoryGroup: "Kertas", materialName: "Kardus Gelombang", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 3.3, basePricePerKg: 2000, hazardousFlag: false, isActive: true },
  { id: "paper_newsprint", categoryGroup: "Kertas", materialName: "Kertas Koran", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 3.3, basePricePerKg: 1800, hazardousFlag: false, isActive: true },
  { id: "paper_mixed", categoryGroup: "Kertas", materialName: "Kertas Campur", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 3.0, basePricePerKg: 1500, hazardousFlag: false, isActive: true },
  { id: "plastic_pet", categoryGroup: "Plastik", materialName: "PET (Botol Minuman)", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 2.5, basePricePerKg: 4000, hazardousFlag: false, isActive: true },
  { id: "plastic_hdpe", categoryGroup: "Plastik", materialName: "HDPE (Galon, Jerigen)", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.8, basePricePerKg: 5000, hazardousFlag: false, isActive: true },
  { id: "plastic_pp", categoryGroup: "Plastik", materialName: "PP (Tutup Botol, Wadah Makanan)", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.8, basePricePerKg: 3500, hazardousFlag: false, isActive: true },
  { id: "plastic_ldpe", categoryGroup: "Plastik", materialName: "LDPE (Kantong Kresek, Wrap)", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.8, basePricePerKg: 2500, hazardousFlag: false, isActive: true },
  { id: "plastic_mixed", categoryGroup: "Plastik", materialName: "Plastik Campur", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.5, basePricePerKg: 1500, hazardousFlag: false, isActive: true },
  { id: "plastic_styrofoam", categoryGroup: "Plastik", materialName: "Styrofoam", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.2, basePricePerKg: 500, hazardousFlag: false, isActive: true },
  { id: "metal_aluminum", categoryGroup: "Logam", materialName: "Aluminium (Kaleng Minuman)", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 8.8, basePricePerKg: 15000, hazardousFlag: false, isActive: true },
  { id: "metal_iron", categoryGroup: "Logam", materialName: "Besi & Baja", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 1.7, basePricePerKg: 3000, hazardousFlag: false, isActive: true },
  { id: "metal_copper", categoryGroup: "Logam", materialName: "Tembaga", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 3.5, basePricePerKg: 50000, hazardousFlag: false, isActive: true },
  { id: "metal_brass", categoryGroup: "Logam", materialName: "Kuningan", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 2.0, basePricePerKg: 25000, hazardousFlag: false, isActive: true },
  { id: "glass_clear", categoryGroup: "Kaca", materialName: "Kaca Bening (Botol)", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 0.3, basePricePerKg: 500, hazardousFlag: false, isActive: true },
  { id: "glass_colored", categoryGroup: "Kaca", materialName: "Kaca Berwarna", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 0.3, basePricePerKg: 400, hazardousFlag: false, isActive: true },
  { id: "ewaste_mobile", categoryGroup: "E-Waste", materialName: "Ponsel / Tablet", unitType: "pcs", conversionFactorToKg: 0.15, emissionSavingFactor: 1.2, basePricePerKg: 25000, hazardousFlag: false, isActive: true },
  { id: "ewaste_laptop", categoryGroup: "E-Waste", materialName: "Laptop", unitType: "pcs", conversionFactorToKg: 2.0, emissionSavingFactor: 1.5, basePricePerKg: 30000, hazardousFlag: false, isActive: true },
  { id: "ewaste_cpu", categoryGroup: "E-Waste", materialName: "CPU / Komputer Desktop", unitType: "pcs", conversionFactorToKg: 8.0, emissionSavingFactor: 1.5, basePricePerKg: 50000, hazardousFlag: false, isActive: true },
  { id: "ewaste_monitor", categoryGroup: "E-Waste", materialName: "Monitor / TV", unitType: "pcs", conversionFactorToKg: 5.0, emissionSavingFactor: 0.8, basePricePerKg: 30000, hazardousFlag: false, isActive: true },
  { id: "ewaste_printer", categoryGroup: "E-Waste", materialName: "Printer / Scanner", unitType: "pcs", conversionFactorToKg: 3.0, emissionSavingFactor: 1.0, basePricePerKg: 15000, hazardousFlag: false, isActive: true },
  { id: "ewaste_cable", categoryGroup: "E-Waste", materialName: "Kabel & Aksesoris", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 2.1, basePricePerKg: 20000, hazardousFlag: false, isActive: true },
  { id: "battery_alkaline", categoryGroup: "Baterai", materialName: "Baterai Alkaline", unitType: "pcs", conversionFactorToKg: 0.05, emissionSavingFactor: 4.5, basePricePerKg: 10000, hazardousFlag: true, isActive: true },
  { id: "battery_lithium", categoryGroup: "Baterai", materialName: "Baterai Lithium / Li-ion", unitType: "pcs", conversionFactorToKg: 0.1, emissionSavingFactor: 5.0, basePricePerKg: 15000, hazardousFlag: true, isActive: true },
  { id: "battery_lead_acid", categoryGroup: "Baterai", materialName: "Aki / Lead-Acid Battery", unitType: "pcs", conversionFactorToKg: 10.0, emissionSavingFactor: 3.8, basePricePerKg: 8000, hazardousFlag: true, isActive: true },
  { id: "textile", categoryGroup: "Tekstil", materialName: "Pakaian / Kain Bekas", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 2.0, basePricePerKg: 1000, hazardousFlag: false, isActive: true },
  { id: "organic_compost", categoryGroup: "Organik", materialName: "Sampah Organik (Kompos)", unitType: "kg", conversionFactorToKg: 1.0, emissionSavingFactor: 0.5, basePricePerKg: 200, hazardousFlag: false, isActive: true },
];

// ============================================================
// Functions
// ============================================================

async function seedWasteCategories() {
  console.log("📋 Seeding waste_categories...");
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
  }

  await batch.commit();
  console.log(`   ✅ ${count} categories seeded`);
  return count;
}

async function createAdminUser(email) {
  console.log(`\n👤 Setting up admin user: ${email}...`);

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;

    // Create/update user document
    await db.collection("users").doc(uid).set({
      uid,
      email,
      fullName: email.split("@")[0],
      phoneNumber: null,
      role: "ADMIN",
      address: null,
      profilePhotoUrl: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Create eco summary
    await db.collection("user_eco_summaries").doc(uid).set({
      userId: uid,
      totalVerifiedWeightKg: 0,
      totalCo2eSavedKg: 0,
      totalEcoPoints: 0,
      totalCashEarned: 0,
      badgeLevel: "Admin",
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`   ✅ Admin user created: ${uid}`);
    return uid;
  } catch (error) {
    console.log(`   ⚠️  User ${email} not found in Firebase Auth. Skipping admin setup.`);
    console.log(`   💡 Create the user in Firebase Auth first, then re-run this script.`);
    return null;
  }
}

async function verifyCollections() {
  console.log("\n🔍 Verifying collections...");

  const collections = [
    "users",
    "user_eco_summaries",
    "waste_categories",
    "waste_transactions",
    "eco_point_redemptions",
    "audit_logs",
  ];

  for (const col of collections) {
    const snapshot = await db.collection(col).limit(1).get();
    console.log(`   ${snapshot.empty ? "📭" : "📬"} ${col}: ${snapshot.size > 0 ? "has data" : "empty (ready)"}`);
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  🌿 BuangYuk Database Initialization");
  console.log("═══════════════════════════════════════════════\n");

  try {
    // 1. Seed waste categories
    await seedWasteCategories();

    // 2. Setup admin if email provided
    const adminEmail = process.argv[2];
    if (adminEmail) {
      await createAdminUser(adminEmail);
    }

    // 3. Verify collections
    await verifyCollections();

    console.log("\n═══════════════════════════════════════════════");
    console.log("  ✨ Database initialization complete!");
    console.log("═══════════════════════════════════════════════");
    console.log("\n📌 Next steps:");
    console.log("   1. Deploy security rules: firebase deploy --only firestore:rules");
    console.log("   2. Deploy indexes: firebase deploy --only firestore:indexes");
    console.log("   3. Deploy storage rules: firebase deploy --only storage");
    console.log(`   4. Run: node scripts/init-database.js admin@yourdomain.com`);
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Initialization failed:", error);
    process.exit(1);
  }
}

main();
