import { initializeApp, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import userSchema from "../models/user.model.js";
import serviceAccount from "../cg-firebase.json" assert { type: "json" };

export default class NotificationService {
  static FIREBASE_APP = null;

  static initializeFirebase() {
    if (!getApps().length) {
      console.log("⚡ Initializing Firebase Admin SDK...");
      this.FIREBASE_APP = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      console.log("✅ Firebase already initialized");
      this.FIREBASE_APP = getApps()[0];
    }
  }

  static async sendNotification(title, body, data = {}, fcm_token) {
    if (!fcm_token) {
      console.warn("⚠️ Missing FCM token");
      return;
    }

    if (!this.FIREBASE_APP) {
      this.initializeFirebase();
    }

    const message = {
      notification: { title, body },
      data: {
        ...data,
        click_action: "REACT_NOTIFICATION_CLICK",
      },
      token: fcm_token,
    };

    console.log("📤 Sending message to FCM:", message);

    try {
      const response = await getMessaging(this.FIREBASE_APP).send(message);
      console.log("✅ Notification sent:", response);
    } catch (error) {
      console.error("❌ Error sending FCM:", error.message, error.code);

      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        console.log("🗑 Deleting invalid FCM token...");
        await this.deleteFcmToken(fcm_token);
      }
    }
  }

  static async deleteFcmToken(fcm_token) {
    try {
      const user = await userSchema.findOne({
        where: {
          fcm_token: fcm_token,
        },
      });

      if (!user) return;

      await user.update({ fcm_token: "" });
      console.log("Deleted FCM token for user:", user.id);
    } catch (err) {
      console.error("Error deleting FCM token:", err.message);
    }
  }
}