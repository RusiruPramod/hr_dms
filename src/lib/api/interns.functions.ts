import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb, getStorageBucket, logAuditEvent } from "../db.server";
import { serverAuthMiddleware } from "./auth.middleware";
import type { InternRecord } from "../types";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 1. List Interns
export const listInternsServer = createServerFn({ method: "GET" })
  .middleware([serverAuthMiddleware])
  .handler(async () => {
    const db = getDb();
    const snap = await db.collection("interns").get();
    const rows = snap.docs.map((d) => d.data() as InternRecord);
    return rows.sort((a, b) => b.updatedAt - a.updatedAt);
  });

// 2. Get Intern
export const getInternServer = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .middleware([serverAuthMiddleware])
  .handler(async ({ input: id }) => {
    const db = getDb();
    const doc = await db.collection("interns").doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as InternRecord;
  });

// 3. Save Intern (Create or Update)
export const saveInternServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      input: z.object({
        fullName: z.string().min(1),
        nameWithInitials: z.string().optional(),
        nic: z.string().min(1),
        address: z.string().min(1),
        department: z.string().min(1),
        startDate: z.string().min(1),
        endDate: z.string().min(1),
        supervisor: z.string().min(1),
        phone: z.string().optional(),
        duration: z.string().optional(),
      }),
      existingId: z.string().optional(),
    }),
  )
  .middleware([serverAuthMiddleware])
  .handler(async ({ input, context }) => {
    const db = getDb();
    const now = Date.now();
    const userUid = context.user.uid;

    let recordId = input.existingId || newId();
    let existingRecord: any = null;

    if (input.existingId) {
      const doc = await db.collection("interns").doc(input.existingId).get();
      if (doc.exists) {
        existingRecord = doc.data();
      }
    }

    const record: InternRecord = {
      ...(existingRecord || {}),
      ...input.input,
      id: recordId,
      createdAt: existingRecord?.createdAt ?? now,
      updatedAt: now,
    };

    await db.collection("interns").doc(recordId).set(record, { merge: true });

    // Write audit log
    await logAuditEvent(
      userUid,
      input.existingId ? "update_intern" : "create_intern",
      "intern",
      recordId,
      { fullName: record.fullName, nic: record.nic },
    );

    return record;
  });

// 4. Delete Intern
export const deleteInternServer = createServerFn({ method: "POST" })
  .inputValidator(z.string())
  .middleware([serverAuthMiddleware])
  .handler(async ({ input: id, context }) => {
    const db = getDb();
    const userUid = context.user.uid;

    const doc = await db.collection("interns").doc(id).get();
    if (doc.exists) {
      const data = doc.data() as InternRecord;

      // Cascade delete files in storage if any
      const bucket = getStorageBucket();
      try {
        // Delete signatures
        if (data.metadata?.signatures) {
          for (const type of Object.keys(data.metadata.signatures)) {
            const url = data.metadata.signatures[type];
            if (url && url.includes("signatures/")) {
              const fileName = url.substring(url.indexOf("signatures/"));
              const decodedFileName = decodeURIComponent(fileName.split("?")[0]);
              await bucket
                .file(decodedFileName)
                .delete()
                .catch(() => {});
            }
          }
        }
        // Delete documents
        if (data.metadata?.documents) {
          for (const docObj of data.metadata.documents) {
            const url = docObj.storageUrl;
            if (url && url.includes("documents/")) {
              const fileName = url.substring(url.indexOf("documents/"));
              const decodedFileName = decodeURIComponent(fileName.split("?")[0]);
              await bucket
                .file(decodedFileName)
                .delete()
                .catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error("Failed to delete associated storage files:", err);
      }

      await db.collection("interns").doc(id).delete();

      // Write audit log
      await logAuditEvent(userUid, "delete_intern", "intern", id, {
        fullName: data.fullName,
        nic: data.nic,
      });
    }
  });

// 5. Upload Signature
export const uploadSignatureServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      internId: z.string(),
      type: z.enum(["intern", "witness", "hr"]),
      signatureBase64: z.string(), // PNG base64 data string (with or without header)
    }),
  )
  .middleware([serverAuthMiddleware])
  .handler(async ({ input, context }) => {
    const db = getDb();
    const bucket = getStorageBucket();
    const userUid = context.user.uid;

    const base64Data = input.signatureBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const filePath = `signatures/${input.internId}/${input.type}-${Date.now()}.png`;

    const file = bucket.file(filePath);
    await file.save(buffer, {
      contentType: "image/png",
      metadata: {
        metadata: {
          uploadedBy: userUid,
        },
      },
    });

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 100 * 365 * 24 * 60 * 60 * 1000, // ~100 years
    });

    // Update intern's signature in Firestore
    const docRef = db.collection("interns").doc(input.internId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Intern record not found");
    }

    const currentData = doc.data() as InternRecord;
    const currentMetadata = currentData.metadata || {};
    const currentSignatures = currentMetadata.signatures || {};

    const updatedMetadata = {
      ...currentMetadata,
      signatures: {
        ...currentSignatures,
        [input.type]: signedUrl,
      },
    };

    await docRef.update({
      metadata: updatedMetadata,
      updatedAt: Date.now(),
    });

    // Log the audit event
    await logAuditEvent(userUid, "upload_signature", "intern", input.internId, {
      type: input.type,
      url: signedUrl,
    });

    return { url: signedUrl };
  });

// 6. Upload Generated Document (PDF)
export const uploadDocumentServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      internId: z.string(),
      type: z.enum(["offer", "nda"]),
      documentBase64: z.string(), // PDF base64 data (with or without header)
      fileName: z.string(),
    }),
  )
  .middleware([serverAuthMiddleware])
  .handler(async ({ input, context }) => {
    const db = getDb();
    const bucket = getStorageBucket();
    const userUid = context.user.uid;

    const base64Data = input.documentBase64.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const filePath = `documents/${input.internId}/${input.type}-${Date.now()}.pdf`;

    const file = bucket.file(filePath);
    await file.save(buffer, {
      contentType: "application/pdf",
      metadata: {
        metadata: {
          uploadedBy: userUid,
        },
      },
    });

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 100 * 365 * 24 * 60 * 60 * 1000, // ~100 years
    });

    // Update intern's documents history in Firestore
    const docRef = db.collection("interns").doc(input.internId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Intern record not found");
    }

    const currentData = doc.data() as InternRecord;
    const currentMetadata = currentData.metadata || {};
    const currentDocs = currentMetadata.documents || [];

    const newDocObj = {
      id: newId(),
      type: input.type,
      fileName: input.fileName,
      storageUrl: signedUrl,
      generatedAt: Date.now(),
    };

    const updatedMetadata = {
      ...currentMetadata,
      documents: [...currentDocs, newDocObj],
    };

    await docRef.update({
      metadata: updatedMetadata,
      updatedAt: Date.now(),
    });

    // Log the audit event
    await logAuditEvent(userUid, "generate_document", "intern", input.internId, {
      type: input.type,
      fileName: input.fileName,
      url: signedUrl,
    });

    return newDocObj;
  });
