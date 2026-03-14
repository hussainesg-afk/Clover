"use client";

import { useState, useEffect, useMemo } from "react";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { getCalendarEventIds, CALENDAR_UPDATED_EVENT } from "@/lib/calendar-events";
import type { Event } from "@/components/EventCard";

export function useChosenEvents(
  allEvents: Event[],
  curatedEvents: Event[]
): { nextEvent: Event | null; laterEvents: Event[] } {
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setSavedEventIds(getCalendarEventIds());
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener(CALENDAR_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CALENDAR_UPDATED_EVENT, refresh);
    };
  }, []);

  return useMemo(() => {
    const now = Date.now();
    const source =
      savedEventIds.length > 0
        ? allEvents.filter((e) => savedEventIds.includes(e.id))
        : curatedEvents;

    const withDate = source
      .filter((e) => e.startDateTime)
      .map((e) => ({
        event: e,
        start: parseEventDateTime(e.startDateTime ?? "")?.getTime() ?? 0,
      }))
      .sort((a, b) => a.start - b.start);

    const future = withDate.filter((x) => x.start >= now);
    const sorted = future.length > 0 ? future : withDate;

    const nextEvent = sorted[0]?.event ?? null;
    const laterEvents = sorted.slice(1, 4).map((x) => x.event);

    return { nextEvent, laterEvents };
  }, [allEvents, curatedEvents, savedEventIds]);
}
