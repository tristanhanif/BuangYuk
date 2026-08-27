import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getMessaging } from "firebase-admin/messaging";

// Initialize Firebase Admin if not already initialized
if (!admin.getApps().length) {
  admin.initializeApp();
}

const app = admin.getApp();

export const adminApp = app;
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export { FieldValue };
