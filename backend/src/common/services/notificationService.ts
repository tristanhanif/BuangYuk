import { Injectable } from "@nestjs/common";
import { messaging } from "@/common/firebaseAdmin";

@Injectable()
export class NotificationService {
  async sendVerificationNotification(
    userId: string,
    transactionId: string,
    co2eSaved: number,
    earnedEcoPoints: number
  ) {
    const payload = {
      notification: {
        title: "Verifikasi Berhasil",
        body: `Transaksi ${transactionId} telah diverifikasi. Emisi terkurangi ${co2eSaved.toFixed(2)} kg CO2e, earned ${earnedEcoPoints} Eco-Points`,
      },
      token: "",
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
    const payload = {
      notification: {
        title: "Transaksi Baru Dibuat",
        body: `Setoran sampah ${categoryName} berhasil dibuat dengan ID ${transactionId}`,
      },
      token: "",
    };

    try {
      const response = await messaging.send(payload);
      return { success: true, response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
