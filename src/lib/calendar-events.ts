const CALENDAR_EVENT_IDS_KEY = "clover_calendar_event_ids";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getCalendarEventIds(): string[] {
  if (!isBrowser()) return [];

  const raw = window.localStorage.getItem(CALENDAR_EVENT_IDS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function isEventInCalendar(eventId: string): boolean {
  return getCalendarEventIds().includes(eventId);
}

export const CALENDAR_UPDATED_EVENT = "clover:calendar-updated";

export function addEventToCalendar(eventId: string): void {
  if (!isBrowser()) return;

  const ids = getCalendarEventIds();
  if (ids.includes(eventId)) return;

  const nextIds = [...ids, eventId];
  window.localStorage.setItem(CALENDAR_EVENT_IDS_KEY, JSON.stringify(nextIds));
  window.dispatchEvent(new CustomEvent(CALENDAR_UPDATED_EVENT));
}
