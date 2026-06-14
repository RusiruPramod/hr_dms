import type { Request } from "node-fetch";
import getFirebaseAdmin from "./firebase-admin";

export async function verifyIdToken(idToken: string) {
  const admin = getFirebaseAdmin();
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (err) {
    console.error("Failed to verify ID token", err);
    throw err;
  }
}

export function getTokenFromHeader(authorization?: string) {
  if (!authorization) return null;
  const parts = authorization.split(" ");
  if (parts.length !== 2) return null;
  return parts[1];
}
