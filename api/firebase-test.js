import {
  initializeApp,
  cert,
  getApps
} from "firebase-admin/app";

import {
  getFirestore
} from "firebase-admin/firestore";

export default async function handler(req, res) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    );

    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount)
        });

    const db = getFirestore(app);

    await db.collection("_backend_test").doc("connection").set({
      status: "connected",
      updatedAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Firebase Admin SDK Connected!",
      firestore: "online"
    });

  } catch (error) {
    console.error("Firebase connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Firebase connection failed."
    });
  }
  }
