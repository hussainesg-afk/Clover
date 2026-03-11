/**
 * Parses event startDateTime from Excel/DB.
 * Handles: "20/04/2026 20:00:00" (DD/MM/YYYY) and "2026-04-20 20:00" (ISO-like).
 */
export function parseEventDateTime(value: string | undefined): Date | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    // DD/MM/YYYY HH:mm:ss or DD/MM/YYYY HH:mm
    const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/;
    const m = trimmed.match(ddmmyyyy);
    if (m) {
      const [, day, month, year, h, min, sec = "0"] = m;
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(h, 10),
        parseInt(min, 10),
        parseInt(sec, 10)
      );
    }

    // ISO-like: 2026-04-20 20:00 or 2026-04-20T20:00
    const iso = trimmed.replace(" ", "T");
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
