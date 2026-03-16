import { NextResponse } from "next/server";
import { init } from "@instantdb/admin";
import * as XLSX from "xlsx";

const EXCEL_HEADERS = [
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

type DbEvent = Record<string, unknown>;

function eventToRow(e: DbEvent): string[] {
  const col = (name: string) => EXCEL_HEADERS.indexOf(name);
  const row: string[] = new Array(EXCEL_HEADERS.length).fill("");
  row[col("Title")] = String(e.title ?? "");
  row[col("Description")] = String(e.description ?? "");
  row[col("Start / Date Time")] = String(e.startDateTime ?? "");
  row[col("Post Code")] = String(e.postCode ?? "");
  row[col("Long Address")] = String(e.address ?? "");
  row[col("Venue Name")] = String(e.venueName ?? "");
  row[col("Cost Type")] = String(e.costType ?? "");
  row[col("Accessibility")] = String(e.accessibility ?? "");
  row[col("Booking URL")] = String(e.bookingUrl ?? "");
  row[col("Link To Interests")] = "";
  row[col("Photo")] = "";
  row[col("Primary Category")] = String(e.primaryCategory ?? "");
  row[col("Music Type")] = String(e.musicType ?? "");
  row[col("Creative Type")] = String(e.creativeType ?? "");
  row[col("Learning Type")] = String(e.learningType ?? "");
  row[col("Social Level")] = String(e.socialLevel ?? "");
  row[col("Event Format")] = String(e.eventFormat ?? "");
  row[col("Meeting People Focus")] = String(e.meetingPeople ?? "");
  row[col("Event Time")] = String(e.eventTime ?? "");
  row[col("Duration Band")] = String(e.durationBand ?? "");
  row[col("Transport Options")] = String(e.transport ?? "");
  row[col("Step-Free Access")] = String(e.stepFree ?? "");
  row[col("Noise Level")] = String(e.noise ?? "");
  row[col("Seating Available")] = String(e.seating ?? "");
  row[col("Price Band")] = String(e.priceBand ?? "");
  row[col("Primary Benefit")] = String(e.primaryBenefit ?? "");
  row[col("Event Mood")] = String(e.eventMood ?? "");
  row[col("LGBTQ+ Focus")] = String(e.lgbtqFocus ?? "");
  return row;
}

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;

  if (!appId || !adminToken) {
    return NextResponse.json(
      { error: "Export not configured" },
      { status: 503 }
    );
  }

  try {
    const db = init({ appId, adminToken });
    const { events } = await db.query({ events: {} });
    const eventList = (events ?? []) as DbEvent[];

    const rows = [EXCEL_HEADERS, ...eventList.map(eventToRow)];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="Bristol_200_Community_Events.xlsx"',
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}
