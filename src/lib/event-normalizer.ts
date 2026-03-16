/**
 * Normalizes event data from different InstantDB schemas into a unified shape.
 * Supports both Bristol Excel schema and alternative schema (event name, cost, tags, etc.)
 */

export interface NormalizedEvent {
  id: string;
  title: string;
  description?: string;
  startDateTime?: string;
  venueName?: string;
  address?: string;
  postCode?: string;
  costType?: string;
  cost?: string;
  primaryCategory?: string;
  bookingUrl?: string;
  priceBand?: string;
  eventFormat?: string;
  tags?: string[];
  eventType?: string;
  lat?: number;
  lng?: number;
  accessibility?: string;
  /** Filter-relevant fields for preference matching */
  musicType?: string;
  creativeType?: string;
  learningType?: string;
  socialLevel?: string;
  meetingPeople?: string;
  eventTime?: string;
  durationBand?: string;
  transport?: string;
  stepFree?: string;
  noise?: string;
  seating?: string;
  primaryBenefit?: string;
  eventMood?: string;
  lgbtqFocus?: string;
}

type RawEvent = Record<string, unknown>;

function getString(obj: RawEvent, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function getTags(raw: RawEvent): string[] {
  const tagsStr = getString(raw, "tags", "Tags");
  if (!tagsStr) return [];
  return tagsStr
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeCost(raw: RawEvent): { costType: string; priceBand: string } {
  const cost = getString(raw, "cost", "cost").toUpperCase();
  const priceBand = getString(raw, "priceBand", "price band", "priceBand").toUpperCase();

  if (cost === "FREE" || priceBand === "FREE") {
    return { costType: "Free", priceBand: "Free events only" };
  }
  if (priceBand === "LOW" || cost.includes("£5") || cost === "5") {
    return { costType: "Paid", priceBand: "Up to £5" };
  }
  if (priceBand === "MEDIUM" || cost.includes("£10") || cost === "10") {
    return { costType: "Paid", priceBand: "Up to £10" };
  }
  if (priceBand === "HIGH" || cost.includes("£20") || cost === "20") {
    return { costType: "Paid", priceBand: "Up to £20" };
  }
  if (getString(raw, "costType", "costType")) {
    return {
      costType: getString(raw, "costType", "costType") || "Paid",
      priceBand: getString(raw, "priceBand", "priceBand") || "",
    };
  }
  return { costType: cost ? "Paid" : "Free", priceBand: priceBand || "" };
}

function deriveCategory(raw: RawEvent, tags: string[]): string {
  const existing = getString(raw, "primaryCategory", "primaryCategory", "primary_category");
  if (existing) return existing;

  const eventType = getString(raw, "eventType", "event type", "eventType").toLowerCase();
  if (eventType.includes("workshop")) return "Arts and Crafts";
  if (eventType.includes("festival")) return "Live music / Gigs";
  if (eventType.includes("activity")) return "Games / Quizzes";

  const tagStr = tags.join(" ");
  if (tagStr.includes("music") || tagStr.includes("dance")) return "Live music / Gigs";
  if (tagStr.includes("workshop") || tagStr.includes("craft") || tagStr.includes("arts"))
    return "Arts and Crafts";
  if (tagStr.includes("theatre")) return "Arts and Crafts";
  if (tagStr.includes("community")) return "Coffee Mornings / Social Chats";
  if (tagStr.includes("heritage") || tagStr.includes("history")) return "Talks / Lectures";

  return "";
}

export function normalizeEvent(raw: RawEvent): NormalizedEvent {
  if (!raw || typeof raw !== "object") {
    return { id: "", title: "Unknown event" };
  }

  const id = String(raw.id ?? raw._id ?? "");
  const title = getString(raw, "title", "eventName", "event name", "name");
  const tags = getTags(raw);
  const { costType, priceBand } = normalizeCost(raw);
  const primaryCategory = deriveCategory(raw, tags);

  return {
    id,
    title: title || id,
    description: getString(raw, "description", "description"),
    startDateTime:
      getString(raw, "startDateTime", "startDateTime") ||
      getString(raw, "start date", "startDate") ||
      getString(raw, "time", "time"),
    venueName: getString(raw, "venueName", "venueName", "venue", "location", "organizer"),
    address: getString(raw, "address", "address"),
    postCode: getString(raw, "postCode", "postCode", "post code"),
    bookingUrl: getString(raw, "bookingUrl", "bookingUrl", "book link", "bookLink"),
    costType: getString(raw, "costType", "costType") || costType,
    priceBand: getString(raw, "priceBand", "priceBand") || priceBand,
    primaryCategory: getString(raw, "primaryCategory", "primaryCategory") || primaryCategory,
    tags,
    eventType: getString(raw, "eventType", "event type", "eventType"),
    lat: typeof raw.lat === "number" ? raw.lat : undefined,
    lng: typeof raw.lng === "number" ? raw.lng : undefined,
    accessibility: getString(raw, "accessibility", "accessibility"),
    cost: getString(raw, "cost", "cost"),
    musicType: getString(raw, "musicType", "musicType") || undefined,
    creativeType: getString(raw, "creativeType", "creativeType") || undefined,
    learningType: getString(raw, "learningType", "learningType") || undefined,
    socialLevel: getString(raw, "socialLevel", "socialLevel") || undefined,
    eventFormat: getString(raw, "eventFormat", "eventFormat") || undefined,
    meetingPeople: getString(raw, "meetingPeople", "meetingPeople") || undefined,
    eventTime: getString(raw, "eventTime", "eventTime") || undefined,
    durationBand: getString(raw, "durationBand", "durationBand") || undefined,
    transport: getString(raw, "transport", "transport") || undefined,
    stepFree: getString(raw, "stepFree", "stepFree") || undefined,
    noise: getString(raw, "noise", "noise") || undefined,
    seating: getString(raw, "seating", "seating") || undefined,
    primaryBenefit: getString(raw, "primaryBenefit", "primaryBenefit") || undefined,
    eventMood: getString(raw, "eventMood", "eventMood") || undefined,
    lgbtqFocus: getString(raw, "lgbtqFocus", "lgbtqFocus") || undefined,
  };
}
