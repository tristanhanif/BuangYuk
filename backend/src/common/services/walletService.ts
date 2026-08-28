import { Injectable, BadRequestException } from "@nestjs/common";
import { firestore, FieldValue } from "@/common/firebaseAdmin";

/**
 * Wallet Service
 *
 * Manages:
 * - Balance (for cashout and marketplace)
 * - Eco Points (for voucher/reward, NOT cashable)
 * - Cashout requests
 * - Minimum cashout: Rp10,000 (configurable)
 * - Cashout fee: Rp1,000 (configurable)
 *
 * All balance mutations use Firestore transactions to prevent race conditions.
 */
@Injectable()
export class WalletService {
  private get wallets() {
    return firestore.collection("wallets");
  }

  private get transactions() {
    return firestore.collection("wallet_transactions");
  }

  private get cashouts() {
    return firestore.collection("cashout_requests");
  }

  /**
   * Get or create a wallet for a user
   */
  async getOrCreateWallet(userId: string) {
    const walletDoc = await this.wallets.doc(userId).get();
    if (walletDoc.exists) {
      return { id: userId, ...walletDoc.data() };
    }

    const walletData = {
      id: userId,
      userId,
      balance: 0,
      ecoPoints: 0,
      currency: "IDR",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await this.wallets.doc(userId).set(walletData);
    return walletData;
  }

  /**
   * Credit balance (from pickup completion) — atomic via runTransaction
   */
  async creditBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
  ) {
    return await firestore.runTransaction(async (t) => {
      const walletRef = this.wallets.doc(userId);
      const walletDoc = await t.get(walletRef);

      if (!walletDoc.exists) {
        const walletData = {
          id: userId,
          userId,
          balance: 0,
          ecoPoints: 0,
          currency: "IDR",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        t.set(walletRef, walletData);
      }

      const wallet = walletDoc.exists ? walletDoc.data()! : { balance: 0 };
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      t.update(walletRef, {
        balance: balanceAfter,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const txnRef = this.transactions.doc();
      t.set(txnRef, {
        id: txnRef.id,
        walletId: userId,
        userId,
        type: "credit",
        amount,
        balanceBefore,
        balanceAfter,
        description,
        pickupId: referenceId || null,
        status: "completed",
        createdAt: FieldValue.serverTimestamp(),
      });

      return { balanceBefore, balanceAfter };
    });
  }

  /**
   * Debit balance (for marketplace purchase or cashout fee) — atomic via runTransaction
   */
  async debitBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
  ) {
    return await firestore.runTransaction(async (t) => {
      const walletRef = this.wallets.doc(userId);
      const walletDoc = await t.get(walletRef);

      if (!walletDoc.exists) {
        throw new BadRequestException("Wallet not found");
      }

      const wallet = walletDoc.data()!;
      if (wallet.balance < amount) {
        throw new BadRequestException("Insufficient balance");
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - amount;

      t.update(walletRef, {
        balance: balanceAfter,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const txnRef = this.transactions.doc();
      t.set(txnRef, {
        id: txnRef.id,
        walletId: userId,
        userId,
        type: "debit",
        amount,
        balanceBefore,
        balanceAfter,
        description,
        orderId: referenceId || null,
        status: "completed",
        createdAt: FieldValue.serverTimestamp(),
      });

      return { balanceBefore, balanceAfter };
    });
  }

  /**
   * Add Eco Points (cannot be converted to cash) — atomic via runTransaction
   */
  async addEcoPoints(
    userId: string,
    points: number,
    description: string,
    pickupId?: string,
  ) {
    return await firestore.runTransaction(async (t) => {
      const walletRef = this.wallets.doc(userId);
      const walletDoc = await t.get(walletRef);

      if (!walletDoc.exists) {
        const walletData = {
          id: userId,
          userId,
          balance: 0,
          ecoPoints: 0,
          currency: "IDR",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        t.set(walletRef, walletData);
      }

      const wallet = walletDoc.exists ? walletDoc.data()! : { ecoPoints: 0 };
      const pointsBefore = wallet.ecoPoints;
      const pointsAfter = pointsBefore + points;

      t.update(walletRef, {
        ecoPoints: pointsAfter,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const ledgerRef = firestore.collection("eco_points").doc();
      t.set(ledgerRef, {
        id: ledgerRef.id,
        userId,
        points,
        type: "earned",
        description,
        pickupId: pickupId || null,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { pointsBefore, pointsAfter };
    });
  }

  /**
   * Redeem Eco Points (for vouchers/rewards, NOT cash) — atomic via runTransaction
   */
  async redeemEcoPoints(
    userId: string,
    points: number,
    description: string,
    rewardItemId?: string,
  ) {
    return await firestore.runTransaction(async (t) => {
      const walletRef = this.wallets.doc(userId);
      const walletDoc = await t.get(walletRef);

      if (!walletDoc.exists) {
        throw new BadRequestException("Wallet not found");
      }

      const wallet = walletDoc.data()!;
      if (wallet.ecoPoints < points) {
        throw new BadRequestException("Insufficient eco points");
      }

      const pointsBefore = wallet.ecoPoints;
      const pointsAfter = pointsBefore - points;

      t.update(walletRef, {
        ecoPoints: pointsAfter,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const ledgerRef = firestore.collection("eco_points").doc();
      t.set(ledgerRef, {
        id: ledgerRef.id,
        userId,
        points,
        type: "redeemed",
        description,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { pointsBefore, pointsAfter };
    });
  }

  /**
   * Request cashout — atomic via runTransaction
   */
  async requestCashout(
    userId: string,
    amount: number,
    minimumCashout: number = 10000,
    cashoutFee: number = 1000,
  ) {
    if (amount < minimumCashout) {
      throw new BadRequestException(`Minimum cashout is Rp${minimumCashout.toLocaleString("id-ID")}`);
    }

    const netAmount = amount - cashoutFee;

    return await firestore.runTransaction(async (t) => {
      const walletRef = this.wallets.doc(userId);
      const walletDoc = await t.get(walletRef);

      if (!walletDoc.exists) {
        throw new BadRequestException("Wallet not found");
      }

      const wallet = walletDoc.data()!;
      if (wallet.balance < amount) {
        throw new BadRequestException("Insufficient balance");
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - amount;

      t.update(walletRef, {
        balance: balanceAfter,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const cashoutRef = this.cashouts.doc();
      t.set(cashoutRef, {
        id: cashoutRef.id,
        userId,
        amount,
        fee: cashoutFee,
        netAmount,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });

      const txnRef = this.transactions.doc();
      t.set(txnRef, {
        id: txnRef.id,
        walletId: userId,
        userId,
        type: "cashout",
        amount,
        balanceBefore,
        balanceAfter,
        description: `Cashout Rp${amount.toLocaleString("id-ID")} (fee Rp${cashoutFee.toLocaleString("id-ID")})`,
        status: "completed",
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        cashoutId: cashoutRef.id,
        amount,
        fee: cashoutFee,
        netAmount,
        status: "pending",
      };
    });
  }

  /**
   * Get wallet transaction history
   */
  async getTransactions(userId: string, limit = 20) {
    const snapshot = await this.transactions
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
