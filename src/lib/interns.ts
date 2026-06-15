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
      const rows = await listInternsServer();
      writeLocal(rows); // cache locally
      return rows;
    } catch (err) {
      console.warn("Server listInterns failed, falling back to localStorage", err);
    }
  }
  return readLocal().sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveIntern(input: InternInput, existingId?: string): Promise<InternRecord> {
  if (firebaseEnabled) {
    try {
      const saved = await saveInternServer({
        data: {
          input: {
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
        },
      });
      // Update local storage cache
      const all = readLocal();
      const next = existingId ? all.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...all];
      writeLocal(next);
      return saved;
    } catch (err) {
      console.warn("Server saveIntern failed, falling back to localStorage", err);
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
  return record;
}

export async function deleteIntern(id: string): Promise<void> {
  const next = readLocal().filter((r) => r.id !== id);
  writeLocal(next);

  if (firebaseEnabled) {
    try {
      await deleteInternServer({ data: id });
    } catch (err) {
      console.warn("Server deleteIntern failed", err);
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
