/**
 * Export questionnaire_responses from InstantDB to Excel.
 * Run: npx tsx scripts/export-questionnaire-responses.ts
 * Requires: .env.local with NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_APP_ADMIN_TOKEN
 *
 * Outputs: Questionnaire_Responses.xlsx (project root)
 */

import { init } from "@instantdb/admin";
import * as XLSX from "xlsx";
import * as path from "path";
import { config } from "dotenv";
import { QUESTIONNAIRE_QUESTIONS } from "../src/config/questions.config";

config({ path: path.join(process.cwd(), ".env.local") });

const questionLookup = new Map(
  QUESTIONNAIRE_QUESTIONS.map((q) => [q.id, q])
);

function resolveOptionLabels(
  questionId: string,
  selectedOptionIds: unknown
): string {
  const ids = Array.isArray(selectedOptionIds)
    ? selectedOptionIds
    : typeof selectedOptionIds === "string"
      ? [selectedOptionIds]
      : [];

  const question = questionLookup.get(questionId);
  if (!question || question.options.length === 0) {
    return ids.join(", ");
  }

  const optionMap = new Map(question.options.map((o) => [o.id, o.label]));
  return ids.map((id) => optionMap.get(id) ?? id).join(", ");
}

function resolveQuestionText(questionId: string): string {
  return questionLookup.get(questionId)?.text ?? questionId;
}

type DbResponse = {
  id: string;
  questionId: string;
  selectedOptionIds: unknown;
  lat?: number;
  lng?: number;
  userId?: string;
  createdAt: number;
};

const HEADERS = [
  "Response ID",
  "User ID",
  "Question ID",
  "Question Text",
  "Selected Option IDs (raw)",
  "Selected Options (labels)",
  "Latitude",
  "Longitude",
  "Created At",
];

function responseToRow(r: DbResponse): string[] {
  const raw = Array.isArray(r.selectedOptionIds)
    ? r.selectedOptionIds.join(", ")
    : String(r.selectedOptionIds ?? "");

  return [
    r.id,
    r.userId ?? "",
    r.questionId,
    resolveQuestionText(r.questionId),
    raw,
    resolveOptionLabels(r.questionId, r.selectedOptionIds),
    r.lat != null ? String(r.lat) : "",
    r.lng != null ? String(r.lng) : "",
    r.createdAt ? new Date(r.createdAt).toISOString() : "",
  ];
}

async function main() {
  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  if (!appId || !adminToken) {
    console.error(
      "Missing NEXT_PUBLIC_INSTANT_APP_ID or INSTANT_APP_ADMIN_TOKEN in .env.local"
    );
    process.exit(1);
  }

  const db = init({ appId, adminToken });
  const { questionnaire_responses } = await db.query({
    questionnaire_responses: {},
  });
  const responses = (questionnaire_responses ?? []) as DbResponse[];

  const rows = [HEADERS, ...responses.map(responseToRow)];
  const ws = XLSX.utils.aoa_to_sheet(rows);

  const colWidths = HEADERS.map((h) => ({ wch: Math.max(h.length + 2, 18) }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Responses");

  const outputPath = path.join(process.cwd(), "Questionnaire_Responses.xlsx");
  XLSX.writeFile(wb, outputPath);
  console.log(
    `Exported ${responses.length} questionnaire responses to ${outputPath}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
