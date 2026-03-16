/**
 * Export events from InstantDB to Excel.
 * Run: npx tsx scripts/export-events-to-excel.ts
 * Requires: .env.local with NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_APP_ADMIN_TOKEN
 *
 * Outputs: Bristol_200_Community_Events_MASTER_V2.xlsx (project root)
 * Optional: --solo to also export solo_events to Bristol_100_Solo_Activities_Master.xlsx
 */

import { init } from "@instantdb/admin";
import * as XLSX from "xlsx";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const EXCEL_HEADERS_200 = [
  "Title",
  "Description",
  "Start / Date Time",
  "Post Code",
  "Long Address",
  "Venue Name",
  "Cost Type",
  "Accessibility",
  "Booking URL",
  "Link To Interests",
  "Photo",
  "Primary Category",
  "Music Type",
  "Creative Type",
  "Learning Type",
  "Social Level",
  "Event Format",
  "Meeting People Focus",
  "Event Time",
  "Duration Band",
  "Transport Options",
  "Step-Free Access",
  "Noise Level",
  "Seating Available",
  "Price Band",
  "Primary Benefit",
  "Event Mood",
  "LGBTQ+ Focus",
];

const EXCEL_HEADERS_100 = [
  "Title",
  "Description",
  "Start / Date Time",
  "Post Code",
  "Long Address",
  "Venue Name",
  "Cost Type",
  "Accessibility",
  "Booking URL",
  "Primary Category",
  "Music Type",
  "Creative Type",
  "Learning Type",
  "Social Level",
  "Event Format",
  "Meeting People Focus",
  "Event Time",
  "Duration Band",
  "Transport Options",
  "Step-Free Access",
  "Noise Level",
  "Seating Available",
  "Price Band",
  "Primary Benefit",
  "Event Mood",
  "LGBTQ+ Focus",
];

type DbEvent = {
  id: string;
  title?: string;
  description?: string;
  startDateTime?: string;
  postCode?: string;
  address?: string;
  venueName?: string;
  costType?: string;
  accessibility?: string;
  bookingUrl?: string;
  primaryCategory?: string;
  musicType?: string;
  creativeType?: string;
  learningType?: string;
  socialLevel?: string;
  eventFormat?: string;
  meetingPeople?: string;
  eventTime?: string;
  durationBand?: string;
  transport?: string;
  stepFree?: string;
  noise?: string;
  seating?: string;
  priceBand?: string;
  primaryBenefit?: string;
  eventMood?: string;
  lgbtqFocus?: string;
};

function eventToRow200(e: DbEvent): string[] {
  const col = (name: string) => EXCEL_HEADERS_200.indexOf(name);
  const row: string[] = new Array(EXCEL_HEADERS_200.length).fill("");
  row[col("Title")] = e.title ?? "";
  row[col("Description")] = e.description ?? "";
  row[col("Start / Date Time")] = e.startDateTime ?? "";
  row[col("Post Code")] = e.postCode ?? "";
  row[col("Long Address")] = e.address ?? "";
  row[col("Venue Name")] = e.venueName ?? "";
  row[col("Cost Type")] = e.costType ?? "";
  row[col("Accessibility")] = e.accessibility ?? "";
  row[col("Booking URL")] = e.bookingUrl ?? "";
  row[col("Link To Interests")] = "";
  row[col("Photo")] = "";
  row[col("Primary Category")] = e.primaryCategory ?? "";
  row[col("Music Type")] = e.musicType ?? "";
  row[col("Creative Type")] = e.creativeType ?? "";
  row[col("Learning Type")] = e.learningType ?? "";
  row[col("Social Level")] = e.socialLevel ?? "";
  row[col("Event Format")] = e.eventFormat ?? "";
  row[col("Meeting People Focus")] = e.meetingPeople ?? "";
  row[col("Event Time")] = e.eventTime ?? "";
  row[col("Duration Band")] = e.durationBand ?? "";
  row[col("Transport Options")] = e.transport ?? "";
  row[col("Step-Free Access")] = e.stepFree ?? "";
  row[col("Noise Level")] = e.noise ?? "";
  row[col("Seating Available")] = e.seating ?? "";
  row[col("Price Band")] = e.priceBand ?? "";
  row[col("Primary Benefit")] = e.primaryBenefit ?? "";
  row[col("Event Mood")] = e.eventMood ?? "";
  row[col("LGBTQ+ Focus")] = e.lgbtqFocus ?? "";
  return row;
}

function eventToRow100(e: DbEvent): string[] {
  const col = (name: string) => EXCEL_HEADERS_100.indexOf(name);
  const row: string[] = new Array(EXCEL_HEADERS_100.length).fill("");
  row[col("Title")] = e.title ?? "";
  row[col("Description")] = e.description ?? "";
  row[col("Start / Date Time")] = e.startDateTime ?? "";
  row[col("Post Code")] = e.postCode ?? "";
  row[col("Long Address")] = e.address ?? "";
  row[col("Venue Name")] = e.venueName ?? "";
  row[col("Cost Type")] = e.costType ?? "";
  row[col("Accessibility")] = e.accessibility ?? "";
  row[col("Booking URL")] = e.bookingUrl ?? "";
  row[col("Primary Category")] = e.primaryCategory ?? "";
  row[col("Music Type")] = e.musicType ?? "";
  row[col("Creative Type")] = e.creativeType ?? "";
  row[col("Learning Type")] = e.learningType ?? "";
  row[col("Social Level")] = e.socialLevel ?? "";
  row[col("Event Format")] = e.eventFormat ?? "";
  row[col("Meeting People Focus")] = e.meetingPeople ?? "";
  row[col("Event Time")] = e.eventTime ?? "";
  row[col("Duration Band")] = e.durationBand ?? "";
  row[col("Transport Options")] = e.transport ?? "";
  row[col("Step-Free Access")] = e.stepFree ?? "";
  row[col("Noise Level")] = e.noise ?? "";
  row[col("Seating Available")] = e.seating ?? "";
  row[col("Price Band")] = e.priceBand ?? "";
  row[col("Primary Benefit")] = e.primaryBenefit ?? "";
  row[col("Event Mood")] = e.eventMood ?? "";
  row[col("LGBTQ+ Focus")] = e.lgbtqFocus ?? "";
  return row;
}

async function main() {
  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  if (!appId || !adminToken) {
    console.error("Missing NEXT_PUBLIC_INSTANT_APP_ID or INSTANT_APP_ADMIN_TOKEN in .env.local");
    process.exit(1);
  }

  const db = init({ appId, adminToken });
  const { events } = await db.query({ events: {} });
  const eventList = (events ?? []) as DbEvent[];

  const rows200 = [EXCEL_HEADERS_200, ...eventList.map(eventToRow200)];
  const ws200 = XLSX.utils.aoa_to_sheet(rows200);
  const wb200 = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb200, ws200, "Sheet1");

  const outputPath200 = path.join(process.cwd(), "Bristol_200_Community_Events_MASTER_V2.xlsx");
  XLSX.writeFile(wb200, outputPath200);
  console.log(`Exported ${eventList.length} events to ${outputPath200}`);

  if (process.argv.includes("--solo")) {
    const { solo_events } = await db.query({ solo_events: {} });
    const soloList = (solo_events ?? []) as DbEvent[];

    const rows100 = [EXCEL_HEADERS_100, ...soloList.map(eventToRow100)];
    const ws100 = XLSX.utils.aoa_to_sheet(rows100);
    const wb100 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb100, ws100, "Sheet1");

    const outputPath100 = path.join(process.cwd(), "Bristol_100_Solo_Activities_Master.xlsx");
    XLSX.writeFile(wb100, outputPath100);
    console.log(`Exported ${soloList.length} solo events to ${outputPath100}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
