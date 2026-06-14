import admin from "firebase-admin";

let initialized = false;

export function getFirebaseAdmin() {
  if (initialized) return admin;

  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svc) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");

  const serviceAccount = JSON.parse(Buffer.from(svc, "base64").toString("utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  initialized = true;
  return admin;
}

export default getFirebaseAdmin;
