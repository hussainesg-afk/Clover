import { unzip, strFromU8 } from "fflate";

export interface DailySummary {
  date: string;
  steps: number;
  distanceKm: number;
  activeEnergyKcal: number;
  exerciseMinutes: number;
  workoutCount: number;
}

export interface ParseResult {
  summaries: DailySummary[];
  dateRange: { start: string; end: string };
  totalDays: number;
}

const RECORD_TYPES: Record<string, keyof DailySummary> = {
  HKQuantityTypeIdentifierStepCount: "steps",
  HKQuantityTypeIdentifierDistanceWalkingRunning: "distanceKm",
  HKQuantityTypeIdentifierActiveEnergyBurned: "activeEnergyKcal",
  HKQuantityTypeIdentifierAppleExerciseTime: "exerciseMinutes",
};

function extractDate(dateStr: string): string | null {
  const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function getAttr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}="([^"]*)"`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

function ensureDay(map: Map<string, DailySummary>, date: string): DailySummary {
  let day = map.get(date);
  if (!day) {
    day = { date, steps: 0, distanceKm: 0, activeEnergyKcal: 0, exerciseMinutes: 0, workoutCount: 0 };
    map.set(date, day);
  }
  return day;
}

function parseXml(xml: string, onProgress?: (pct: number) => void): DailySummary[] {
  const days = new Map<string, DailySummary>();
  const len = xml.length;

  const RECORD_RE = /<Record\s[^>]*?\/>/gi;
  const WORKOUT_RE = /<Workout\s[^>]*?(?:\/>|>)/gi;

  let match: RegExpExecArray | null;
  let count = 0;
  let lastPct = 0;

  while ((match = RECORD_RE.exec(xml)) !== null) {
    count++;
    if (count % 5000 === 0 && onProgress) {
      const pct = Math.round((match.index / len) * 100);
      if (pct > lastPct) {
        lastPct = pct;
        onProgress(pct);
      }
    }

    const tag = match[0];
    const type = getAttr(tag, "type");
    if (!type) continue;

    const field = RECORD_TYPES[type];
    if (!field) continue;

    const dateStr = getAttr(tag, "startDate");
    const valStr = getAttr(tag, "value");
    if (!dateStr || !valStr) continue;

    const date = extractDate(dateStr);
    const val = parseFloat(valStr);
    if (!date || isNaN(val)) continue;

    const day = ensureDay(days, date);
    (day[field] as number) += val;
  }

  WORKOUT_RE.lastIndex = 0;
  while ((match = WORKOUT_RE.exec(xml)) !== null) {
    const tag = match[0];
    const dateStr = getAttr(tag, "startDate");
    if (!dateStr) continue;
    const date = extractDate(dateStr);
    if (!date) continue;
    ensureDay(days, date).workoutCount += 1;
  }

  onProgress?.(100);
  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function parseHealthExport(
  file: File,
  onProgress?: (stage: string, pct: number) => void
): Promise<ParseResult> {
  onProgress?.("Reading file...", 0);
  const buf = new Uint8Array(await file.arrayBuffer());

  let xmlBytes: Uint8Array;

  if (file.name.toLowerCase().endsWith(".zip")) {
    onProgress?.("Decompressing...", 10);
    const entries = await new Promise<Record<string, Uint8Array>>(
      (resolve, reject) => {
        unzip(buf, (err, data) => {
          if (err) reject(new Error("Failed to decompress ZIP: " + err.message));
          else resolve(data);
        });
      }
    );

    const keys = Object.keys(entries);
    const xmlKey = keys.find((k) => k.toLowerCase().endsWith("export.xml"))
      ?? keys.find((k) => k.toLowerCase().endsWith(".xml") && entries[k].length > 1000);

    if (!xmlKey) {
      throw new Error(
        "No export.xml found in the ZIP file. Found: " +
          keys.slice(0, 5).join(", ") +
          (keys.length > 5 ? ` (and ${keys.length - 5} more)` : "")
      );
    }
    xmlBytes = entries[xmlKey];
  } else if (file.name.toLowerCase().endsWith(".xml")) {
    xmlBytes = buf;
  } else {
    throw new Error("Please upload a .zip or .xml file from Apple Health.");
  }

  onProgress?.("Decoding...", 20);
  const xml = strFromU8(xmlBytes);

  onProgress?.("Parsing health records...", 25);
  const summaries = parseXml(xml, (pct) => {
    onProgress?.("Parsing health records...", 25 + Math.round(pct * 0.7));
  });

  onProgress?.("Done", 100);

  if (summaries.length === 0) {
    throw new Error(
      "No health records found in the file. Make sure this is an Apple Health export."
    );
  }

  return {
    summaries,
    dateRange: {
      start: summaries[0].date,
      end: summaries[summaries.length - 1].date,
    },
    totalDays: summaries.length,
  };
}
