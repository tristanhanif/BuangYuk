import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";

@Injectable()
export class NotificationService {
  async sendVerificationNotification(
    userId: string,
    transactionId: string,
    co2eSaved: number,
    earnedEcoPoints: number
  ) {
    const payload: admin.messaging.Message = {
      notification: {
        title: "Verifikasi Berhasil",
        body: `Transaksi ${transactionId} telah diverifikasi. Emisi terkurangi ${co2eSaved.toFixed(2)} kg CO2e, earned ${earnedEcoPoints} Eco-Points`,
      },
      token: "",
    };

    try {
      const response = await admin.messaging().send(payload);
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendNewTransactionNotification(
    userId: string,
    transactionId: string,
    categoryName: string
  ) {
    const payload: admin.messaging.Message = {
      notification: {
        title: "Transaksi Baru Dibuat",
        body: `Setoran sampah ${categoryName} berhasil dibuat dengan ID ${transactionId}`,
      },
      token: "",
    };

    try {
      const response = await admin.messaging().send(payload);
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}