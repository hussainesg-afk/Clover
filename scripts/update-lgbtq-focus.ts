/**
 * Update LGBTQ+ Focus column for events.
 * Usage:
 *   npx tsx scripts/update-lgbtq-focus.ts --analyze   # Phase 1: analyze, output report
 *   npx tsx scripts/update-lgbtq-focus.ts --apply     # Phase 3: update Excel + InstantDB
 *
 * Requires: .env.local with NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_APP_ADMIN_TOKEN (for --apply)
 */

import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { homedir } from "os";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const REPORT_PATH = path.join(process.cwd(), "lgbtq-focus-report.json");
const OVERRIDES_PATH = path.join(process.cwd(), "lgbtq-focus-overrides.json");

const CLEAR_MATCH_KEYWORDS = [
  "lgbtq",
  "lgbt",
  "queer",
  "gay",
  "lesbian",
  "trans",
  "transgender",
  "pride",
  "sexual orientation",
  "gender identity",
  "non-binary",
  "nonbinary",
];

const BORDERLINE_KEYWORDS = [
  "diversity",
  "inclusive",
  "inclusivity",
  "community",
  "support group",
];

function analyzeText(text: string): { suggested: "yes" | "no" | "review"; reason: string } {
  const lower = (text || "").toLowerCase();

  for (const kw of CLEAR_MATCH_KEYWORDS) {
    if (lower.includes(kw)) {
      return { suggested: "yes", reason: `Clear match: "${kw}"` };
    }
  }

  for (const kw of BORDERLINE_KEYWORDS) {
    if (lower.includes(kw)) {
      return { suggested: "review", reason: `Borderline: "${kw}"` };
    }
  }

  return { suggested: "no", reason: "No matches" };
}

function analyzeEvent(title: string, description: string): { suggested: "yes" | "no" | "review"; reason: string } {
  const combined = `${title || ""} ${description || ""}`.trim();
  return analyzeText(combined);
}

function getExcelPath(filename: string): string {
  const home = process.env.HOME || homedir();
  const downloads = path.join(home, "Downloads", filename);
  const cwd = path.join(process.cwd(), filename);
  if (fs.existsSync(cwd)) return cwd;
  if (fs.existsSync(downloads)) return downloads;
  return cwd;
}

interface EventAnalysis {
  rowIndex: number;
  title: string;
  suggested: "yes" | "no" | "review";
  reason: string;
  source: string;
}

function processExcelFile(
  filePath: string,
  sourceName: string
): { rows: string[][]; headers: string[]; analyses: EventAnalysis[] } {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
  const headers = rows[0];
  const col = (name: string) => headers.indexOf(name);
  const titleCol = col("Title");
  const descCol = col("Description");

  const analyses: EventAnalysis[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const title = (row[titleCol] ?? "").toString().trim();
    if (!title) continue;
    const description = (row[descCol] ?? "").toString().trim();
    const { suggested, reason } = analyzeEvent(title, description);
    analyses.push({ rowIndex: i + 1, title, suggested, reason, source: sourceName });
  }
  return { rows, headers, analyses };
}

function runAnalyze() {
  const excel200Path = getExcelPath("Bristol_200_Community_Events_MASTER_V2.xlsx");
  const excel100Path = getExcelPath("Bristol_100_Solo_Activities_Master.xlsx");

  if (!fs.existsSync(excel200Path)) {
    console.error(`Excel not found: ${excel200Path}`);
    process.exit(1);
  }

  const allAnalyses: EventAnalysis[] = [];
  const events200 = processExcelFile(excel200Path, "events");
  allAnalyses.push(...events200.analyses);

  if (fs.existsSync(excel100Path)) {
    const events100 = processExcelFile(excel100Path, "solo_events");
    allAnalyses.push(...events100.analyses);
  } else {
    console.warn(`Solo events Excel not found: ${excel100Path}`);
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(allAnalyses, null, 2));
  console.log(`Report written to ${REPORT_PATH}`);

  const overridesTemplate: Record<string, "yes" | "no"> = {};
  const borderline = allAnalyses.filter((a) => a.suggested === "review");
  if (borderline.length > 0) {
    console.log(`\nBorderline events (${borderline.length}) - add overrides in ${OVERRIDES_PATH}:`);
    borderline.forEach((a) => {
      overridesTemplate[a.title] = "yes"; // default suggestion
    });
  }
  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overridesTemplate, null, 2));
  console.log(`Overrides template written to ${OVERRIDES_PATH}`);

  const yesCount = allAnalyses.filter((a) => a.suggested === "yes").length;
  const noCount = allAnalyses.filter((a) => a.suggested === "no").length;
  console.log(`\nSummary: ${yesCount} clear yes, ${noCount} no, ${borderline.length} for review`);
}

function loadOverrides(): Record<string, "yes" | "no"> {
  if (!fs.existsSync(OVERRIDES_PATH)) return {};
  const raw = fs.readFileSync(OVERRIDES_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function getLgbtqFocus(
  title: string,
  analysis: EventAnalysis,
  overrides: Record<string, "yes" | "no">
): "Yes" | undefined {
  const override = overrides[title];
  if (override === "yes") return "Yes";
  if (override === "no") return undefined;
  return analysis.suggested === "yes" ? "Yes" : undefined;
}

async function runApply() {
  const excel200Path = getExcelPath("Bristol_200_Community_Events_MASTER_V2.xlsx");
  const excel100Path = getExcelPath("Bristol_100_Solo_Activities_Master.xlsx");

  if (!fs.existsSync(excel200Path)) {
    console.error(`Excel not found: ${excel200Path}`);
    process.exit(1);
  }

  const overrides = loadOverrides();

  function updateExcelFile(filePath: string, sourceName: string) {
    if (!fs.existsSync(filePath)) return;
    const { rows, headers, analyses } = processExcelFile(filePath, sourceName);
    const lgbtqColName = "LGBTQ+ Focus";
    let lgbtqColIndex = headers.indexOf(lgbtqColName);
    if (lgbtqColIndex === -1) {
      headers.push(lgbtqColName);
      lgbtqColIndex = headers.length - 1;
    }

    const analysisByTitle = new Map(analyses.map((a) => [a.title, a]));
    const titleColIndex = headers.indexOf("Title");
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const title = (row[titleColIndex] ?? "").toString().trim();
      if (!title) continue;
      const analysis = analysisByTitle.get(title);
      if (analysis) {
        const value = getLgbtqFocus(title, analysis, overrides);
        while (row.length <= lgbtqColIndex) row.push("");
        row[lgbtqColIndex] = value ?? "";
      }
    }

    rows[0] = headers;
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filePath);
    console.log(`Updated Excel: ${filePath}`);
  }

  updateExcelFile(excel200Path, "events");
  if (fs.existsSync(excel100Path)) {
    updateExcelFile(excel100Path, "solo_events");
  }

  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  if (!appId || !adminToken) {
    console.warn("Missing INSTANT_APP_ADMIN_TOKEN - skipping InstantDB update");
    return;
  }

  const { init } = await import("@instantdb/admin");
  const db = init({ appId, adminToken });

  const { events } = await db.query({ events: {} });
  const { solo_events } = await db.query({ solo_events: {} });

  const events200 = processExcelFile(excel200Path, "events");
  const titleToFocus = new Map<string, "Yes" | undefined>();
  for (const a of events200.analyses) {
    titleToFocus.set(a.title, getLgbtqFocus(a.title, a, overrides));
  }

  if (fs.existsSync(excel100Path)) {
    const events100 = processExcelFile(excel100Path, "solo_events");
    for (const a of events100.analyses) {
      titleToFocus.set(a.title, getLgbtqFocus(a.title, a, overrides));
    }
  }

  const eventList = (events ?? []) as { id: string; title?: string }[];
  const soloList = (solo_events ?? []) as { id: string; title?: string }[];
  const batchSize = 25;
  let updated = 0;

  for (let i = 0; i < eventList.length; i += batchSize) {
    const batch = eventList.slice(i, i + batchSize);
    const tx = batch.map((e) => {
      const focus = titleToFocus.get((e.title ?? "").trim());
      return db.tx.events[e.id].update({ lgbtqFocus: focus });
    });
    if (tx.length > 0) {
      await db.transact(tx);
      updated += tx.length;
    }
  }

  for (let i = 0; i < soloList.length; i += batchSize) {
    const batch = soloList.slice(i, i + batchSize);
    const tx = batch.map((e) => {
      const focus = titleToFocus.get((e.title ?? "").trim());
      return db.tx.solo_events[e.id].update({ lgbtqFocus: focus });
    });
    if (tx.length > 0) {
      await db.transact(tx);
      updated += tx.length;
    }
  }

  console.log(`Updated ${updated} records in InstantDB`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--analyze")) {
    runAnalyze();
  } else if (args.includes("--apply")) {
    await runApply();
  } else {
    console.error("Usage: npx tsx scripts/update-lgbtq-focus.ts --analyze | --apply");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
