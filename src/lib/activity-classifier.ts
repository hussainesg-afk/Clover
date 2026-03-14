/**
 * Classifies events into activity types for the Activity page.
 * Maps to Physical, Mental, or Social based on primaryCategory, primaryBenefit, tags, etc.
 */

export type ActivityType = "physical" | "mental" | "social";

export interface ClassifiableEvent {
  primaryCategory?: string;
  primaryBenefit?: string;
  eventType?: string;
  tags?: string[];
  creativeType?: string;
  learningType?: string;
  socialLevel?: string;
  meetingPeople?: string;
}

const PHYSICAL_KEYWORDS = [
  "yoga", "cycling", "fitness", "sport", "exercise", "movement", "walk", "run",
  "dance", "swim", "gym", "physical", "strength", "balance", "cycle",
];

const MENTAL_KEYWORDS = [
  "arts", "craft", "creative", "learning", "lecture", "talk", "theatre",
  "music", "drawing", "painting", "workshop", "cultural", "heritage", "history",
  "cognitive", "mental", "enrichment",
];

const SOCIAL_KEYWORDS = [
  "coffee", "social", "community", "chat", "meeting", "group", "connect",
];

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export function classifyActivityType(event: ClassifiableEvent): ActivityType {
  const cat = (event.primaryCategory ?? "").toLowerCase();
  const benefit = (event.primaryBenefit ?? "").toLowerCase();
  const eventType = (event.eventType ?? "").toLowerCase();
  const tags = (event.tags ?? []).join(" ").toLowerCase();
  const creative = (event.creativeType ?? "").toLowerCase();
  const learning = (event.learningType ?? "").toLowerCase();
  const social = (event.socialLevel ?? "").toLowerCase();
  const meeting = (event.meetingPeople ?? "").toLowerCase();
  const combined = [cat, benefit, eventType, tags, creative, learning, social, meeting].join(" ");

  if (matchesKeywords(combined, PHYSICAL_KEYWORDS)) return "physical";
  if (matchesKeywords(combined, MENTAL_KEYWORDS)) return "mental";
  if (matchesKeywords(combined, SOCIAL_KEYWORDS)) return "social";

  if (event.primaryCategory) {
    const c = event.primaryCategory.toLowerCase();
    if (c.includes("coffee") || c.includes("social") || c.includes("chat")) return "social";
    if (c.includes("arts") || c.includes("craft") || c.includes("talk") || c.includes("lecture"))
      return "mental";
    if (c.includes("yoga") || c.includes("fitness") || c.includes("sport") || c.includes("cycle"))
      return "physical";
  }

  return "social";
}
