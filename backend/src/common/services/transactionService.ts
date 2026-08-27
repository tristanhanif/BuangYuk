import { Injectable } from "@nestjs/common";
import { firestore } from "@/lib/firebaseAdmin";

@Injectable()
export class TransactionService {
  async executeVerificationTransaction(
    transactionId: string,
    verifiedWeightKg: number,
    adjustedSubCategoryId?: string
  ) {
    const transaction = firestore.transaction();

    const txRef = firestore.doc(`waste_transactions/${transactionId}`);
    const txDoc = await transaction.get(txRef);

    if (!txDoc.exists) {
      throw new Error("Transaction not found");
    }

    const txData = txDoc.data();

    if (txData.status !== "PENDING") {
      throw new Error("Transaction already verified or rejected");
    }

    const subCatRef = firestore.doc(`waste_categories/${adjustedSubCategoryId || txData.subCategoryId}`);
    const subCatDoc = await transaction.get(subCatRef);

    if (!subCatDoc.exists) {
      throw new Error("Category not found");
    }

    const subCatData = subCatDoc.data();

    const weightKg = verifiedWeightKg;
    const emissionFactor = subCatData.emissionSavingFactor || 0;
    const basePrice = subCatData.basePricePerKg || 0;

    const co2eSaved = weightKg * emissionFactor;
    const earnedCash = Math.floor(weightKg * basePrice);
    const earnedEcoPoints = Math.round((weightKg * 10) + (co2eSaved * 50));

    await transaction.update(txRef, {
      status: "VERIFIED",
      verifiedWeightKg,
      verifiedCo2eSaved: co2eSaved,
      earnedCash,
      earnedEcoPoints,
      verifierId: "system",
      verifierNote: "",
      verifiedAt: firestore.FieldValue.serverTimestamp(),
    });

    const userId = txData.userId;
    const summaryRef = firestore.doc(`user_eco_summaries/${userId}`);

    await transaction.update(summaryRef, {
      totalVerifiedWeightKg: firestore.FieldValue.increment(weightKg),
      totalCo2eSavedKg: firestore.FieldValue.increment(co2eSaved),
      totalEcoPoints: firestore.FieldValue.increment(earnedEcoPoints),
      totalCashEarned: firestore.FieldValue.increment(earnedCash),
      lastUpdated: firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      verifiedCo2eSaved: co2eSaved,
      earnedCash,
      earnedEcoPoints,
      status: "VERIFIED",
    };
  }
}