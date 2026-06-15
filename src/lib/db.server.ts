import getFirebaseAdmin from "./firebase-admin";

export function getDb() {
  const admin = getFirebaseAdmin();
  return admin.firestore();
}

export function getStorageBucket() {
  const admin = getFirebaseAdmin();
  return admin.storage().bucket();
}

/**
 * Log an event to the audit logs collection in Firestore
 */
export async function logAuditEvent(
  userId: string | undefined,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, any> = {},
) {
  try {
    const db = getDb();
    const ref = db.collection("audit_logs").doc();
    await ref.set({
      id: ref.id,
      userId: userId || "system",
      action,
      targetType,
      targetId,
      metadata,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
