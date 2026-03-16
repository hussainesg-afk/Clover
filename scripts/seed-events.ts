/**
 * Seed script: reads Bristol_200_Community_Events_MASTER_V2.xlsx and inserts events into InstantDB.
 * Run: npx tsx scripts/seed-events.ts
 * Requires: .env with NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_APP_ADMIN_TOKEN
 * Get admin token from InstantDB dashboard.
 *
 * Uses Postcodes.io (free) to geocode each event's postcode for accurate map pins.
 */

import { init, id } from "@instantdb/admin";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { homedir } from "os";
import { config } from "dotenv";
import { geocodePostcode } from "../src/lib/geocode-postcode";

config({ path: path.join(process.cwd(), ".env.local") });

const BS3_CENTRE = { lat: 51.44, lng: -2.6 };

const postcodeCache = new Map<string, { lat: number; lng: number }>();

async function postcodeToLatLng(postcode: string): Promise<{ lat: number; lng: number }> {
  const key = postcode.trim().replace(/\s+/g, "").toUpperCase();
  if (!key) return BS3_CENTRE;
  const cached = postcodeCache.get(key);
  if (cached) return cached;
  const result = await geocodePostcode(postcode);
  if (result) {
    postcodeCache.set(key, result);
    return result;
  }
  return BS3_CENTRE;
}

async function main() {
  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  if (!appId) {
    console.error("Missing NEXT_PUBLIC_INSTANT_APP_ID in .env.local");
    process.exit(1);
  }
  if (!adminToken) {
    console.error("Missing INSTANT_APP_ADMIN_TOKEN. Get from InstantDB dashboard.");
    process.exit(1);
  }

  const home = process.env.HOME || homedir();
  const excelPath = path.join(home, "Downloads", "Bristol_200_Community_Events_MASTER_V2.xlsx");
  const altPath = path.join(process.cwd(), "Bristol_200_Community_Events_MASTER_V2.xlsx");
  const filePath = fs.existsSync(excelPath) ? excelPath : altPath;
  if (!fs.existsSync(filePath)) {
    console.error(`Excel not found. Place Bristol_200_Community_Events_MASTER_V2.xlsx in ~/Downloads or project root`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
  const headers = rows[0];
  const dataRows = rows.slice(1);

  const col = (name: string) => headers.indexOf(name);

  const db = init({
    appId,
    adminToken,
  });

  // Clear existing events before seeding (so we replace with fresh V2 data)
  const { events: existingEvents } = await db.query({ events: {} });
  const eventList = (existingEvents ?? []) as { id: string }[];
  const eventIds = eventList.map((e) => e.id);
  if (eventIds.length > 0) {
    const deleteBatchSize = 50;
    for (let i = 0; i < eventIds.length; i += deleteBatchSize) {
      const batch = eventIds.slice(i, i + deleteBatchSize);
      await db.transact(batch.map((eid) => db.tx.events[eid].delete()));
      console.log(`Cleared ${Math.min(i + deleteBatchSize, eventIds.length)} / ${eventIds.length} old events`);
    }
    console.log("Cleared existing events.");
  }

  const batchSize = 25;
  for (let i = 0; i < dataRows.length; i += batchSize) {
    const batch = dataRows.slice(i, i + batchSize);
    const filtered = batch.filter((row) => row[col("Title")]);
    const tx = [];
    for (const row of filtered) {
      const postCode = row[col("Post Code")] || "";
      const { lat, lng } = await postcodeToLatLng(postCode);
      tx.push(
        db.tx.events[id()].update({
          title: row[col("Title")] || "",
          description: row[col("Description")] || "",
          startDateTime: row[col("Start / Date Time")] || "",
          postCode,
          address: row[col("Long Address")] || "",
          venueName: row[col("Venue Name")] || "",
          costType: row[col("Cost Type")] || "",
          accessibility: row[col("Accessibility")] || "",
          bookingUrl: row[col("Booking URL")] || "",
          primaryCategory: row[col("Primary Category")] || "",
          musicType: row[col("Music Type")] || undefined,
          creativeType: row[col("Creative Type")] || undefined,
          learningType: row[col("Learning Type")] || undefined,
          socialLevel: row[col("Social Level")] || undefined,
          eventFormat: row[col("Event Format")] || undefined,
          meetingPeople: row[col("Meeting People Focus")] || undefined,
          eventTime: row[col("Event Time")] || undefined,
          durationBand: row[col("Duration Band")] || undefined,
          transport: row[col("Transport Options")] || undefined,
          stepFree: row[col("Step-Free Access")] || undefined,
          noise: row[col("Noise Level")] || undefined,
          seating: row[col("Seating Available")] || undefined,
          priceBand: row[col("Price Band")] || undefined,
          primaryBenefit: row[col("Primary Benefit")] || undefined,
          eventMood: row[col("Event Mood")] || undefined,
          lgbtqFocus: row[col("LGBTQ+ Focus")] || row[col("LGBTQ Focus")] || undefined,
          lat,
          lng,
        })
      );
    }
    if (tx.length > 0) {
      await db.transact(tx);
    }
    console.log(`Seeded ${Math.min(i + batchSize, dataRows.length)} / ${dataRows.length}`);
  }
  console.log("Done seeding events.");
}

main().catch(console.error);
