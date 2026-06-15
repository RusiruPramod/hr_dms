import { differenceInMonths, format, parseISO } from "date-fns";

export function formatDocDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMMM yyyy");
  } catch {
    return iso;
  }
}

export function durationMonths(startISO?: string, endISO?: string): string {
  if (!startISO || !endISO) return "—";
  try {
    const m = differenceInMonths(parseISO(endISO), parseISO(startISO));
    if (m <= 0) return "—";
    return `${m} ${m === 1 ? "month" : "months"}`;
  } catch {
    return "—";
  }
}

export function firstName(full?: string): string {
  if (!full) return "";
  return full.trim().split(/\s+/)[0] ?? "";
}

export function honorific(full?: string): string {
  return full ? "Mr./Ms." : "Mr./Ms.";
}

export function formatNic(nic?: string): string {
  if (!nic) return "—";
  // Normalise common NIC formats (keep as-is for non-standard values)
  const cleaned = nic.replace(/\s|-/g, "");
  // If it's 12 digits, group for readability
  if (/^\d{12}$/.test(cleaned))
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  return nic;
}
