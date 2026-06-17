import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, query, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { z } from "zod";
import { db, storage, auth } from "../firebase";
import type { InternRecord } from "../types";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 1. List Interns
export const listInternsServer = async () => {
  try {
    console.log('[Firestore] 🔍 Querying interns collection...');
    const snap = await getDocs(collection(db, "interns"));
    const rows = snap.docs.map((d) => d.data() as InternRecord);
    console.log(`[Firestore] ✅ Query successful: ${rows.length} records`);
    return rows.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error("[Firestore] ❌ Failed to list interns:", err);
    throw err;
  }
};

// 2. Get Intern
export const getInternServer = async (id: string) => {
  try {
    console.log(`[Firestore] 📖 Getting document: ${id}`);
    const docRef = doc(db, "interns", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn(`[Firestore] ⚠️ Document not found: ${id}`);
      return null;
    }
    console.log(`[Firestore] ✅ Document found: ${id}`);
    return docSnap.data() as InternRecord;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      console.error(`[Firestore] 🔐 Permission Denied (Code: ${err.code}):`, err.message);
    } else {
      console.error(`[Firestore] ❌ Failed to get intern:`, err);
    }
    throw err;
  }
};

// 3. Save Intern (Create or Update)
export const saveInternServer = async (input: {
  fullName: string;
  nameWithInitials?: string;
  nic: string;
  address: string;
  department: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  phone?: string;
  duration?: string;
}, existingId?: string) => {
  try {
    console.log(`[Firestore] 💾 Saving record: ${input.fullName}`, { isUpdate: !!existingId });
    const now = Date.now();
    let recordId = existingId || newId();
    let existingRecord: any = null;

    if (existingId) {
      const docRef = doc(db, "interns", existingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        existingRecord = docSnap.data();
      }
    }

    const record: InternRecord = {
      ...(existingRecord || {}),
      ...input,
      id: recordId,
      createdAt: existingRecord?.createdAt ?? now,
      updatedAt: now,
    };

    await setDoc(doc(db, "interns", recordId), record, { merge: true });
    console.log(`[Firestore] ✅ Save successful: ${recordId}`);
    return record;
  } catch (err) {
    console.error("[Firestore] ❌ Failed to save intern:", err);
    throw err;
  }
};

// 4. Delete Intern
export const deleteInternServer = async (id: string) => {
  try {
    console.log(`[Firestore] 🗑️ Deleting record: ${id}`);
    const docRef = doc(db, "interns", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as InternRecord;

      // Try to delete signatures from storage
      if (data.metadata?.signatures) {
        for (const type of Object.keys(data.metadata.signatures)) {
          try {
            const url = data.metadata.signatures[type];
            if (url && url.includes("signatures/")) {
              const fileName = url.substring(url.indexOf("signatures/"));
              const decodedFileName = decodeURIComponent(fileName.split("?")[0]);
              const fileRef = ref(storage, decodedFileName);
              await deleteObject(fileRef).catch(() => {});
              console.log(`[Storage] 🗑️ Deleted signature: ${type}`);
            }
          } catch (err) {
            console.warn("[Storage] ⚠️ Failed to delete signature file:", err);
          }
        }
      }

      // Try to delete documents from storage
      if (data.metadata?.documents) {
        for (const docObj of data.metadata.documents) {
          try {
            const url = docObj.storageUrl;
            if (url && url.includes("documents/")) {
              const fileName = url.substring(url.indexOf("documents/"));
              const decodedFileName = decodeURIComponent(fileName.split("?")[0]);
              const fileRef = ref(storage, decodedFileName);
              await deleteObject(fileRef).catch(() => {});
              console.log(`[Storage] 🗑️ Deleted document file`);
            }
          } catch (err) {
            console.warn("[Storage] ⚠️ Failed to delete document file:", err);
          }
        }
      }

      await deleteDoc(docRef);
      console.log(`[Firestore] ✅ Delete successful: ${id}`);
    }
  } catch (err) {
    console.error("[Firestore] ❌ Failed to delete intern:", err);
    throw err;
  }
};

// 5. Upload Signature
export const uploadSignatureServer = async (internId: string, type: "intern" | "witness" | "hr", signatureBase64: string) => {
  try {
    const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    const filePath = `signatures/${internId}/${type}-${Date.now()}.png`;
    const fileRef = ref(storage, filePath);
    
    await uploadBytes(fileRef, buffer, {
      contentType: "image/png",
    });

    const downloadUrl = await getDownloadURL(fileRef);

    // Update intern's signature in Firestore
    const docRef = doc(db, "interns", internId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Intern record not found");
    }

    const currentData = docSnap.data() as InternRecord;
    const currentMetadata = currentData.metadata || {};
    const currentSignatures = currentMetadata.signatures || {};

    const updatedMetadata = {
      ...currentMetadata,
      signatures: {
        ...currentSignatures,
        [type]: downloadUrl,
      },
    };

    await updateDoc(docRef, {
      metadata: updatedMetadata,
      updatedAt: Date.now(),
    });

    return { url: downloadUrl };
  } catch (err) {
    console.error("Failed to upload signature:", err);
    throw err;
  }
};

// 6. Upload Generated Document (PDF)
export const uploadDocumentServer = async (internId: string, type: "offer" | "nda", documentBase64: string, fileName: string) => {
  try {
    const base64Data = documentBase64.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    const filePath = `documents/${internId}/${type}-${Date.now()}.pdf`;
    const fileRef = ref(storage, filePath);
    
    await uploadBytes(fileRef, buffer, {
      contentType: "application/pdf",
    });

    const downloadUrl = await getDownloadURL(fileRef);

    // Update intern's documents history in Firestore
    const docRef = doc(db, "interns", internId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Intern record not found");
    }

    const currentData = docSnap.data() as InternRecord;
    const currentMetadata = currentData.metadata || {};
    const currentDocs = currentMetadata.documents || [];

    const newDocObj = {
      id: newId(),
      type,
      fileName,
      storageUrl: downloadUrl,
      generatedAt: Date.now(),
    };

    const updatedMetadata = {
      ...currentMetadata,
      documents: [...currentDocs, newDocObj],
    };

    await updateDoc(docRef, {
      metadata: updatedMetadata,
      updatedAt: Date.now(),
    });

    return newDocObj;
  } catch (err) {
    console.error("Failed to upload document:", err);
    throw err;
  }
};
