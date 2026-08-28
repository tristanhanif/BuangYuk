import { Injectable } from "@nestjs/common";
import { messaging, firestore } from "@/common/firebaseAdmin";

@Injectable()
export class NotificationService {
  private async getTokenForUser(userId: string): Promise<string | null> {
    try {
      const tokenDoc = await firestore.collection("fcm_tokens").doc(userId).get();
      return tokenDoc.exists ? tokenDoc.data()!.token : null;
    } catch {
      return null;
    }
  }

  async sendVerificationNotification(
    userId: string,
    transactionId: string,
    co2eSaved: number,
    earnedEcoPoints: number
  ) {
    const token = await this.getTokenForUser(userId);
    if (!token) {
      return { success: false, error: "No FCM token found for user" };
    }

    const payload = {
      notification: {
        title: "Verifikasi Berhasil",
        body: `Transaksi ${transactionId} telah diverifikasi. Emisi terkurangi ${co2eSaved.toFixed(2)} kg CO2e, earned ${earnedEcoPoints} Eco-Points`,
      },
      token,
    };

    try {
      const response = await messaging.send(payload);
      return { success: true, response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async sendNewTransactionNotification(
    userId: string,
    transactionId: string,
    categoryName: string
  ) {
    const token = await this.getTokenForUser(userId);
    if (!token) {
      return { success: false, error: "No FCM token found for user" };
    }

    const payload = {
      notification: {
        title: "Transaksi Baru Dibuat",
        body: `Setoran sampah ${categoryName} berhasil dibuat dengan ID ${transactionId}`,
      },
      token,
    };

    try {
      const response = await messaging.send(payload);
      return { success: true, response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
