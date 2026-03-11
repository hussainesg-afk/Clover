"use client";

import { format } from "date-fns";
import { parseEventDateTime } from "@/lib/parse-event-date";

const CATEGORY_COLORS = [
  "bg-teal-100 text-teal-800",
  "bg-emerald-100 text-emerald-800",
  "bg-cyan-100 text-cyan-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-purple-100 text-purple-800",
  "bg-amber-100 text-amber-800",
  "bg-orange-100 text-orange-800",
  "bg-rose-100 text-rose-800",
  "bg-lime-100 text-lime-800",
] as const;

function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash += category.charCodeAt(i);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDateTime?: string;
  venueName?: string;
  address?: string;
  postCode?: string;
  costType?: string;
  priceBand?: string;
  primaryCategory?: string;
  bookingUrl?: string;
  lat?: number;
  lng?: number;
  accessibility?: string;
}

interface EventCardProps {
  event: Event;
  onEventClick?: (event: Event) => void;
}

export default function EventCard({ event, onEventClick }: EventCardProps) {
  let dateStr = "";
  if (event.startDateTime) {
    const d = parseEventDateTime(event.startDateTime);
    dateStr = d ? format(d, "EEE, MMM d · h:mm a") : event.startDateTime;
  }

  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-stone-900">{event.title}</h3>
        <p className="mt-1 text-sm text-stone-500">{dateStr}</p>
        {event.venueName && (
          <p className="mt-0.5 text-sm text-stone-600">
            {event.venueName}
            {event.address && ` · ${event.address}`}
          </p>
        )}
        {event.primaryCategory && (
          <span className={`mt-2 inline-block rounded-xl px-3 py-1 text-xs font-medium ${getCategoryColor(event.primaryCategory)}`}>
            {event.primaryCategory}
          </span>
        )}
      </div>
      <span
        className={`shrink-0 rounded-xl px-3 py-1 text-xs font-medium ${
          event.costType === "Free"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {event.costType || "Paid"}
      </span>
    </div>
  );

  const className =
    "block w-full rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-200 hover:shadow-md hover:shadow-teal-100/50 cursor-pointer";

  if (onEventClick) {
    return (
      <button
        type="button"
        onClick={() => onEventClick(event)}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={event.bookingUrl || "#"}
      target={event.bookingUrl ? "_blank" : undefined}
      rel={event.bookingUrl ? "noopener noreferrer" : undefined}
      className={className}
    >
      {content}
    </a>
  );
}
