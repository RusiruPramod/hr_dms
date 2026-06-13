// Data access layer. Uses Firestore when configured, otherwise localStorage.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";
import type { InternRecord, InternInput } from "./types";

const KEY = "docuflow.interns.v1";
const COL = "interns";

function readLocal(): InternRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as InternRecord[]) : [];
  } catch {
    return [];
  }
}
function writeLocal(rows: InternRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listInterns(): Promise<InternRecord[]> {
  if (firebaseEnabled && db) {
    try {
      const snap = await getDocs(collection(db, COL));
      const rows = snap.docs.map((d) => d.data() as InternRecord);
      writeLocal(rows); // cache locally
      return rows.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (err) {
      console.warn("Firestore read failed, falling back to localStorage", err);
    }
  }
  return readLocal().sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveIntern(
  input: InternInput,
  existingId?: string,
): Promise<InternRecord> {
  const now = Date.now();
  const all = readLocal();
  const existing = existingId ? all.find((r) => r.id === existingId) : undefined;
  const record: InternRecord = {
    ...input,
    id: existing?.id ?? newId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const next = existing
    ? all.map((r) => (r.id === record.id ? record : r))
    : [record, ...all];
  writeLocal(next);

  if (firebaseEnabled && db) {
    try {
      await setDoc(doc(db, COL, record.id), record);
    } catch (err) {
      console.warn("Firestore write failed (kept locally)", err);
    }
  }
  return record;
}

export async function deleteIntern(id: string): Promise<void> {
  const next = readLocal().filter((r) => r.id !== id);
  writeLocal(next);
  if (firebaseEnabled && db) {
    try {
      await deleteDoc(doc(db, COL, id));
    } catch (err) {
      console.warn("Firestore delete failed", err);
    }
  }
}

export async function getIntern(id: string): Promise<InternRecord | null> {
  const rows = await listInterns();
  return rows.find((r) => r.id === id) ?? null;
}
