import type { Event } from "@/components/EventCard";

function getSearchableStrings(event: Event): string[] {
  const strings: string[] = [
    event.title,
    event.description,
    event.venueName,
    event.address,
    event.primaryCategory,
    event.postCode,
  ].filter((s): s is string => typeof s === "string" && s.length > 0);
  const tags = (event as { tags?: string[] }).tags;
  if (Array.isArray(tags)) {
    strings.push(...tags);
  }
  return strings;
}

export function filterEventsBySearch(events: Event[], query: string): Event[] {
  const q = query.trim().toLowerCase();
  if (!q) return events;
  return events.filter((event) => {
    const searchable = getSearchableStrings(event);
    return searchable.some((s) => s.toLowerCase().includes(q));
  });
}
