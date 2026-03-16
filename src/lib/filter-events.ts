import type { Event } from "@/components/EventCard";
import {
  OPTION_TO_EVENT_ATTR,
  QUESTION_TO_EVENT_ATTR,
  ACTIVITY_TO_TAG_KEYWORDS,
  CREATIVE_TO_TAG_KEYWORDS,
  MUSIC_TO_TAG_KEYWORDS,
  LEARNING_TO_TAG_KEYWORDS,
} from "./filter-mapping";
import { normalizeEvent, type NormalizedEvent } from "@/lib/event-normalizer";
import { parseEventDateTime } from "@/lib/parse-event-date";

export interface QuestionnaireResponse {
  questionId: string;
  selectedOptionIds: string | string[];
  createdAt?: number;
  lat?: number;
  lng?: number;
}

export interface EventMatchDebug {
  eventId: string;
  title: string;
  score: number;
  matchedQuestionIds: string[];
}

export interface FilterDebugInfo {
  hardFilters: {
    activityCategories: string[];
    spendingChoice: string | null;
    eventTimingSlots: string[];
    distanceFilter?: { maxMiles: number; userPostcode?: string };
  };
  /** "perfect" = all filters matched; "close" = fallback to best partial matches */
  matchMode: "perfect" | "close";
  matches: EventMatchDebug[];
}

/** Haversine distance in miles between two lat/lng points */
function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ONLINE_KEYWORDS = ["online", "virtual", "zoom", "teams"];

function isOnlineEvent(event: NormalizedEvent): boolean {
  const searchable = [
    event.eventFormat ?? "",
    event.eventType ?? "",
    event.venueName ?? "",
    event.description ?? "",
    ...(event.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return ONLINE_KEYWORDS.some((kw) => searchable.includes(kw));
}

function tagsMatchKeywords(tags: string[], keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const tagStr = tags.join(" ");
  return keywords.some((kw) => tagStr.includes(kw.toLowerCase()));
}

/** Derives "Weekday mornings" / "Weekend evenings" etc. from a Date */
function deriveEventTimeSlot(d: Date): string {
  const day = d.getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;
  const hour = d.getHours();
  const period = hour < 12 ? "mornings" : hour < 17 ? "afternoons" : "evenings";
  return (isWeekend ? "Weekend" : "Weekday") + " " + period;
}

/** Returns true if event matches at least one allowed time slot (weekday/weekend + morning/afternoon/evening) */
function eventMatchesTimingPreference(
  event: NormalizedEvent,
  allowedEventTimes: Set<string>
): boolean {
  if (allowedEventTimes.size === 0) return true;

  const eventTimeStr = (event.eventTime ?? "").trim();
  if (eventTimeStr) {
    const ev = eventTimeStr.toLowerCase();
    for (const allowed of allowedEventTimes) {
      const al = allowed.toLowerCase();
      if (ev === al || ev.includes(al) || al.includes(ev)) return true;
    }
    return false;
  }

  const d = parseEventDateTime(event.startDateTime ?? "");
  if (!d) return true;
  const derived = deriveEventTimeSlot(d);
  return allowedEventTimes.has(derived) || [...allowedEventTimes].some((a) => derived.toLowerCase().includes(a.toLowerCase()));
}

function scoreEventAgainstResponses(
  event: NormalizedEvent,
  responseMap: Map<string, string[]>
): { score: number; matchedQuestionIds: string[] } {
  let score = 0;
  const matchedQuestionIds: string[] = [];
  const tags = event.tags ?? [];

  for (const [questionId, optionIds] of responseMap) {
    const attr = QUESTION_TO_EVENT_ATTR[questionId];
    if (!attr || attr === "_skip") continue;

    const mapping = OPTION_TO_EVENT_ATTR[questionId];
    if (!mapping) continue;

    const isTagBased = ["activity-types", "creative-activities", "music-events", "learning-events"].includes(questionId);

    for (const optId of optionIds) {
      const mappedVal = mapping[optId];
      if (!mappedVal) continue;
      if (mappedVal === "*" && !isTagBased) continue;

      let match = false;

      if (questionId === "activity-types") {
        if (event.primaryCategory) {
          const eventVal = event.primaryCategory;
          match =
            eventVal === mappedVal ||
            Boolean(eventVal && mappedVal && eventVal.toLowerCase().includes(mappedVal.toLowerCase()));
        } else {
          const keywords = ACTIVITY_TO_TAG_KEYWORDS[optId] ?? [];
          match = tagsMatchKeywords(tags, keywords);
        }
      } else if (questionId === "creative-activities") {
        const keywords = CREATIVE_TO_TAG_KEYWORDS[optId];
        match = keywords ? tagsMatchKeywords(tags, keywords) : false;
        if (!match && event.creativeType) {
          const ev = String(event.creativeType ?? "");
          const mv = String(mappedVal ?? "");
          match = ev.toLowerCase().includes(mv.toLowerCase()) || mv === "*";
        }
      } else if (questionId === "music-events") {
        const keywords = MUSIC_TO_TAG_KEYWORDS[optId];
        match = keywords ? tagsMatchKeywords(tags, keywords) : false;
        if (!match && event.musicType) {
          const ev = String(event.musicType ?? "");
          const mv = String(mappedVal ?? "");
          match = ev.toLowerCase().includes(mv.toLowerCase()) || mv === "*";
        }
      } else if (questionId === "learning-events") {
        const keywords = LEARNING_TO_TAG_KEYWORDS[optId];
        match = keywords ? tagsMatchKeywords(tags, keywords) : false;
        if (!match && event.learningType) {
          const ev = String(event.learningType ?? "");
          const mv = String(mappedVal ?? "");
          match = ev.toLowerCase().includes(mv.toLowerCase()) || mv === "*";
        }
      } else {
        const eventVal = (event as unknown as Record<string, unknown>)[attr] as string;
        const eventValStr = (eventVal ?? "").toString();
        const mv = String(mappedVal ?? "");
        match =
          eventValStr === mv ||
          Boolean(eventValStr && mv && eventValStr.toLowerCase().includes(mv.toLowerCase()));
      }

      if (match) {
        score += 1;
        matchedQuestionIds.push(questionId);
        break;
      }
    }
  }

  return { score, matchedQuestionIds };
}

const CLOSE_MATCH_LIMIT = 15;

export function filterEventsWithDebug(
  events: Event[],
  responses: QuestionnaireResponse[]
): { events: Event[]; debug: FilterDebugInfo } {
  const normalizedEvents = events.map((e) => normalizeEvent(e as unknown as Record<string, unknown>));

  const getPriceRank = (value?: string): number => {
    const v = (value ?? "").trim().toLowerCase();
    if (v === "free" || v === "free events only") return 0;
    if (v === "up to £5" || v === "low" || v === "£5") return 1;
    if (v === "up to £10" || v === "medium" || v === "£10") return 2;
    if (v === "up to £20" || v === "high" || v === "£20") return 3;
    return Number.POSITIVE_INFINITY;
  };

  const responseMap = new Map<string, string[]>();
  const responseTimeMap = new Map<string, number>();
  for (const r of responses) {
    const createdAt = r.createdAt ?? 0;
    const currentTs = responseTimeMap.get(r.questionId) ?? -1;
    if (createdAt < currentTs) continue;

    const ids = Array.isArray(r.selectedOptionIds)
      ? r.selectedOptionIds
      : [r.selectedOptionIds];
    responseMap.set(r.questionId, ids);
    responseTimeMap.set(r.questionId, createdAt);
  }

  if (responseMap.size === 0) {
    return {
      events: events,
      debug: {
        hardFilters: {
          activityCategories: [],
          spendingChoice: null,
          eventTimingSlots: [],
        },
        matchMode: "perfect",
        matches: [],
      },
    };
  }

  // Hard filter: activity type - use primaryCategory OR tags when category is empty
  let candidateEvents = normalizedEvents;
  const activityIds = responseMap.get("activity-types");
  let activityCategories: string[] = [];
  let eventTimingSlots: string[] = [];
  if (activityIds?.length) {
    const activityMapping = OPTION_TO_EVENT_ATTR["activity-types"] ?? {};
    const allowedCategories = new Set(
      activityIds
        .map((id) => activityMapping[id])
        .filter((value): value is string => Boolean(value) && value !== "*")
    );
    activityCategories = Array.from(allowedCategories);
    if (allowedCategories.size > 0) {
      candidateEvents = candidateEvents.filter((event) => {
        const eventCat = (event.primaryCategory ?? "").toLowerCase();
        const tags = event.tags ?? [];
        if (eventCat) {
          return [...allowedCategories].some(
            (allowed) =>
              eventCat === allowed.toLowerCase() ||
              eventCat.includes(allowed.toLowerCase()) ||
              allowed.toLowerCase().includes(eventCat)
          );
        }
        return activityIds.some((id) => {
          const keywords = ACTIVITY_TO_TAG_KEYWORDS[id] ?? [];
          return tagsMatchKeywords(tags, keywords);
        });
      });
    }
  }

  // Hard filter: spending - support both priceBand and cost
  const spendingIds = responseMap.get("spending");
  const spendingChoice = spendingIds?.[0] ?? null;
  if (spendingIds?.length) {
    const choice = spendingIds[0];
    const maxRankByChoice: Record<string, number> = {
      free: 0,
      "up-to-5": 1,
      "up-to-10": 2,
      "up-to-20": 3,
    };
    const maxRank = maxRankByChoice[choice];
    if (maxRank !== undefined) {
      candidateEvents = candidateEvents.filter((event) => {
        const rankFromBand = getPriceRank(event.priceBand);
        const rankFromCost = getPriceRank(
          event.costType ?? (event as NormalizedEvent).cost
        );
        const eventRank = Math.min(rankFromBand, rankFromCost);
        return eventRank <= maxRank;
      });
    }
  }

  // Hard filter: event timing (weekday vs weekend) - exclude events that don't match user's preferred slots
  const timingIds = responseMap.get("event-timing");
  if (timingIds?.length) {
    const timingMapping = OPTION_TO_EVENT_ATTR["event-timing"] ?? {};
    const allowedEventTimes = new Set(
      timingIds
        .map((id) => timingMapping[id])
        .filter((value): value is string => Boolean(value) && value !== "*")
    );
    eventTimingSlots = Array.from(allowedEventTimes);
    if (allowedEventTimes.size > 0) {
      candidateEvents = candidateEvents.filter((event) =>
        eventMatchesTimingPreference(event, allowedEventTimes)
      );
    }
  }

  // Hard filter: distance - requires postcode (with lat/lng) and travel-distance preference
  const travelDistanceId = responseMap.get("travel-distance")?.[0];
  const postcodeResponse = responses
    .filter((r) => r.questionId === "postcode")
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0];
  const userLat = postcodeResponse?.lat;
  const userLng = postcodeResponse?.lng;
  const postcodeStr = (() => {
    const ids = postcodeResponse?.selectedOptionIds;
    const arr = Array.isArray(ids) ? ids : ids != null ? [ids] : [];
    const first = arr[0];
    return typeof first === "string" ? first.trim() : "";
  })();

  const TRAVEL_MAX_MILES: Record<string, number> = {
    "under-1mile": 1,
    "1-2miles": 2,
    "3-5miles": 5,
  };

  let distanceFilterDebug: { maxMiles: number; userPostcode?: string } | undefined;

  if (travelDistanceId === "online-only") {
    candidateEvents = candidateEvents.filter((e) => isOnlineEvent(e));
    distanceFilterDebug = { maxMiles: -1, userPostcode: undefined }; // -1 = online only
  } else if (
    travelDistanceId &&
    TRAVEL_MAX_MILES[travelDistanceId] != null &&
    typeof userLat === "number" &&
    typeof userLng === "number"
  ) {
    const maxMiles = TRAVEL_MAX_MILES[travelDistanceId];
    candidateEvents = candidateEvents.filter((event) => {
      const elat = event.lat;
      const elng = event.lng;
      if (typeof elat !== "number" || typeof elng !== "number") return false;
      return haversineDistanceMiles(userLat, userLng, elat, elng) <= maxMiles;
    });
    distanceFilterDebug = { maxMiles, userPostcode: postcodeStr || undefined };
  }
  // "anywhere-city" or no travel-distance / no postcode: no distance filter

  let matchMode: "perfect" | "close" = "perfect";
  let eventsToScore = candidateEvents;

  // If no events match our strict filters, fall back to "close matches" — score all events by preference overlap
  if (candidateEvents.length === 0) {
    matchMode = "close";
    eventsToScore = normalizedEvents;
  }

  const scored = eventsToScore.map((event) => {
    const { score, matchedQuestionIds } = scoreEventAgainstResponses(event, responseMap);
    return { event, score, matchedQuestionIds };
  });

  let sorted = scored
    .sort((a, b) => b.score - a.score)
    .filter((s) => s.score > 0)
    .slice(0, matchMode === "close" ? CLOSE_MATCH_LIMIT : undefined);

  // Sort by distance (closest first) when we have user coords.
  if (typeof userLat === "number" && typeof userLng === "number") {
    sorted = [...sorted].sort((a, b) => {
      const aLat = a.event.lat;
      const aLng = a.event.lng;
      const bLat = b.event.lat;
      const bLng = b.event.lng;
      const aHas = typeof aLat === "number" && typeof aLng === "number";
      const bHas = typeof bLat === "number" && typeof bLng === "number";
      if (!aHas && !bHas) return 0;
      if (!aHas) return 1;
      if (!bHas) return -1;
      const distA = haversineDistanceMiles(userLat, userLng, aLat!, aLng!);
      const distB = haversineDistanceMiles(userLat, userLng, bLat!, bLng!);
      return distA - distB;
    });
  }

  return {
    events: sorted.map((s) => toEvent(s.event)),
    debug: {
      hardFilters: {
        activityCategories,
        spendingChoice,
        eventTimingSlots,
        ...(distanceFilterDebug && { distanceFilter: distanceFilterDebug }),
      },
      matchMode,
      matches: sorted.map((s) => ({
        eventId: s.event.id,
        title: s.event.title,
        score: s.score,
        matchedQuestionIds: s.matchedQuestionIds,
      })),
    },
  };
}

function toEvent(n: NormalizedEvent): Event {
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    startDateTime: n.startDateTime,
    venueName: n.venueName,
    address: n.address,
    postCode: n.postCode,
    costType: n.costType,
    priceBand: n.priceBand,
    primaryCategory: n.primaryCategory,
    bookingUrl: n.bookingUrl,
    lat: n.lat,
    lng: n.lng,
    accessibility: n.accessibility,
    lgbtqFocus: n.lgbtqFocus,
  };
}

export function filterEventsByResponses(
  events: Event[],
  responses: QuestionnaireResponse[]
): Event[] {
  return filterEventsWithDebug(events, responses).events;
}
