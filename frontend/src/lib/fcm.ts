import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebaseClient";

let messaging: ReturnType<typeof getMessaging> | null = null;

/**
 * Initialize FCM messaging (browser only)
 */
export function initFCM() {
  if (typeof window === "undefined") return null;

  try {
    if (!messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch {
    return null;
  }
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const msg = initFCM();
    if (!msg) return null;

    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY || "",
    });

    if (token) {
      console.log("FCM Token:", token);
      // Store token in Firestore for sending notifications
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebaseClient");
      await setDoc(doc(db, "fcm_tokens", userId), {
        token,
        userId,
        createdAt: serverTimestamp(),
      });
    }

    return token;
  } catch (error) {
    console.error("FCM error:", error);
    return null;
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  const msg = initFCM();
  if (!msg) return;

  onMessage(msg, (payload) => {
    console.log("Foreground message:", payload);
    callback(payload);

    // Show in-app notification
    if (payload.notification) {
      new Notification(payload.notification.title || "BuangYuk", {
        body: payload.notification.body || "",
        icon: "/favicon.ico",
      });
    }
  });
}

/**
 * Notification types for pickup lifecycle
 */
export const NOTIFICATION_TYPES = {
  PICKUP_CREATED: "pickup_created",
  COLLECTOR_ASSIGNED: "collector_assigned",
  COLLECTOR_ACCEPTED: "collector_accepted",
  COLLECTOR_ARRIVING: "collector_arriving",
  COLLECTOR_ARRIVED: "collector_arrived",
  VERIFICATION_REQUIRED: "verification_required",
  CUSTOMER_CONFIRMATION_REQUIRED: "customer_confirmation_required",
  PICKUP_COMPLETED: "pickup_completed",
  PAYMENT_SUCCESSFUL: "payment_successful",
  PAYMENT_FAILED: "payment_failed",
  DISPUTE_CREATED: "dispute_created",
  DISPUTE_RESOLVED: "dispute_resolved",
  EARNINGS_AVAILABLE: "earnings_available",
} as const;
