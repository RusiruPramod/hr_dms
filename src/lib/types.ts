export interface InternRecord {
  id: string;
  fullName: string;
  nameWithInitials: string;
  nic: string;
  address: string;
  department: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  supervisor: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
  duration?: string;
  metadata?: Record<string, any>;
}

export type InternInput = Omit<InternRecord, "id" | "createdAt" | "updatedAt">;
