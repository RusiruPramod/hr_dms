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
