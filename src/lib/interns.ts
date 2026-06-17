import { firebaseEnabled } from "./firebase";
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

import {
  listInternsServer,
  getInternServer,
  saveInternServer,
  deleteInternServer,
} from "./api/interns.functions";

export async function listInterns(): Promise<InternRecord[]> {
  if (firebaseEnabled) {
    try {
      console.log('[Firebase] 📡 Fetching interns from Firestore...')
      const rows = await listInternsServer()
      console.log(`[Firebase] ✅ Fetched ${rows.length} records`)
      writeLocal(rows) // cache locally
      return rows
    } catch (err) {
      console.warn('[Firebase] ⚠️ Server listInterns failed, falling back to localStorage', err)
    }
  }
  const local = readLocal().sort((a, b) => b.updatedAt - a.updatedAt)
  console.log(`[LocalStorage] 📦 Loaded ${local.length} records from cache`)
  return local
}

export async function saveIntern(input: InternInput, existingId?: string): Promise<InternRecord> {
  if (firebaseEnabled) {
    try {
      console.log(`[Firebase] 💾 Saving intern: ${input.fullName}`, { existingId, firebaseEnabled: true });
      const saved = await saveInternServer(
        {
          fullName: input.fullName,
          nameWithInitials: input.nameWithInitials ?? "",
          nic: input.nic,
          address: input.address,
          department: input.department,
          startDate: input.startDate,
          endDate: input.endDate,
          supervisor: input.supervisor,
          phone: input.phone ?? "",
          duration: input.duration ?? "",
        },
        existingId,
      );
      console.log(`[Firebase] ✅ Successfully saved: ${saved.id}`);
      // Update local storage cache
      const all = readLocal();
      const next = existingId ? all.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...all];
      writeLocal(next);
      return saved;
    } catch (err) {
      console.warn(`[Firebase] ⚠️ Save failed, falling back to localStorage:`, err);
    }
  }

  const now = Date.now();
  const all = readLocal();
  const existing = existingId ? all.find((r) => r.id === existingId) : undefined;
  const record: InternRecord = {
    ...input,
    id: existing?.id ?? newId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const next = existing ? all.map((r) => (r.id === record.id ? record : r)) : [record, ...all];
  writeLocal(next);
  console.log(`[LocalStorage] 📦 Saved to cache: ${record.id}`);
  return record;
}

export async function deleteIntern(id: string): Promise<void> {
  console.log(`[LocalStorage] 🗑️ Deleting record: ${id}`);
  const next = readLocal().filter((r) => r.id !== id);
  writeLocal(next);

  if (firebaseEnabled) {
    try {
      console.log(`[Firebase] 🗑️ Deleting from Firestore: ${id}`);
      await deleteInternServer(id);
      console.log(`[Firebase] ✅ Successfully deleted: ${id}`);
    } catch (err) {
      console.warn(`[Firebase] ⚠️ Delete failed:`, err);
    }
  }
}

export async function getIntern(id: string): Promise<InternRecord | null> {
  if (firebaseEnabled) {
    try {
      return await getInternServer({ data: id });
    } catch (err) {
      console.warn("Server getIntern failed, falling back to localStorage", err);
    }
  }
  const rows = await listInterns();
  return rows.find((r) => r.id === id) ?? null;
}
