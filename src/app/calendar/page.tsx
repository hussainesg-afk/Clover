"use client";

import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/db";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getCalendarEventIds, CALENDAR_UPDATED_EVENT } from "@/lib/calendar-events";
import EventDetailModal from "@/components/EventDetailModal";
import type { Event } from "@/components/EventCard";
import { normalizeEvent } from "@/lib/event-normalizer";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: string;
  isSaved?: boolean;
}

function SavedEventWithPopover({ event }: { event: CalendarEvent }) {
  const [showPopover, setShowPopover] = useState(false);

  const timeStr = format(event.start, "EEE, MMM d · h:mm a");
  const venue = event.resource;

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span className="block truncate">{event.title}</span>
      {showPopover && (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          role="tooltip"
        >
          <p className="font-medium text-stone-900">{event.title}</p>
          <p className="mt-0.5 text-xs text-stone-500">{timeStr}</p>
          {venue && <p className="mt-0.5 text-xs text-stone-400">{venue}</p>}
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-stone-200 bg-white" />
        </div>
      )}
    </div>
  );
}

const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface AppleToolbarProps {
  label: string;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY" | "DATE") => void;
  onView: (view: "month" | "week" | "day" | "agenda") => void;
  view: "month" | "week" | "day" | "agenda";
}

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

function AppleLikeToolbar({ label, onNavigate, onView, view }: AppleToolbarProps) {
  const viewOptions: Array<"month" | "week" | "day"> = ["month", "week", "day"];

  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onNavigate("PREV")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={() => onNavigate("TODAY")}
          className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onNavigate("NEXT")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          aria-label="Next"
        >
          <ChevronRight />
        </button>
      </div>
      <h2 className="text-center text-xl font-semibold tracking-tight text-stone-900 sm:text-left">{label}</h2>
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/50 p-0.5">
          {viewOptions.map((viewOption) => (
            <button
              key={viewOption}
              type="button"
              onClick={() => onView(viewOption)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                view === viewOption
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {viewOption}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";
  const part = email.split("@")[0];
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [calendarMode, setCalendarMode] = useState<"saved" | "all">("all");
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [date, setDate] = useState(() => new Date());
  const { user } = db.useAuth();
  const { isLoading, error, data } = db.useQuery({ events: {} });
  const greetingName = getGreetingName(user?.email);

  const eventsList = useMemo(() => data?.events ?? [], [data?.events]);

  useEffect(() => {
    const refreshSavedEventIds = () => setSavedEventIds(getCalendarEventIds());

    refreshSavedEventIds();
    window.addEventListener("focus", refreshSavedEventIds);
    window.addEventListener("storage", refreshSavedEventIds);
    window.addEventListener(CALENDAR_UPDATED_EVENT, refreshSavedEventIds);

    return () => {
      window.removeEventListener("focus", refreshSavedEventIds);
      window.removeEventListener("storage", refreshSavedEventIds);
      window.removeEventListener(CALENDAR_UPDATED_EVENT, refreshSavedEventIds);
    };
  }, []);

  const effectiveCalendarMode =
    savedEventIds.length === 0 && calendarMode === "saved" ? "all" : calendarMode;

  const calendarSourceEvents = useMemo(() => {
    if (effectiveCalendarMode === "all") return eventsList;
    if (savedEventIds.length === 0) return [];
    return eventsList.filter((e: { id: string }) => savedEventIds.includes(e.id));
  }, [effectiveCalendarMode, eventsList, savedEventIds]);

  const events = useMemo(() => {
    const list = calendarSourceEvents;
    return list
      .filter((e: { startDateTime?: string }) => e.startDateTime)
      .map((e: Record<string, unknown>) => {
        const n = normalizeEvent(e);
        const start = parseEventDateTime(n.startDateTime ?? "") ?? new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return {
          id: n.id,
          title: n.title,
          start,
          end,
          resource: n.venueName,
          isSaved: savedEventIds.includes(n.id),
        };
      });
  }, [calendarSourceEvents, savedEventIds]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-red-700 shadow-sm">
        <p className="font-medium">Connection error</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            {greetingName ? `Hello, ${greetingName}` : "Calendar"}
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            {savedEventIds.length > 0
              ? "View your saved events or browse all community events."
              : "Add events from the Events page to build your calendar."}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50/50 p-0.5">
          <button
            type="button"
            onClick={() => setCalendarMode("saved")}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              effectiveCalendarMode === "saved"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            My Calendar
          </button>
          <button
            type="button"
            onClick={() => setCalendarMode("all")}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              effectiveCalendarMode === "all"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      <div className="apple-calendar relative mt-6 h-[680px] overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={["month", "week", "day"]}
          tooltipAccessor={null}
          view={view}
          date={date}
          onNavigate={(newDate: Date) => setDate(newDate)}
          onView={(newView: string) => {
            if (newView === "month" || newView === "week" || newView === "day") setView(newView);
          }}
          components={{
            toolbar: AppleLikeToolbar,
            event: ({ event }: { event: CalendarEvent }) =>
              event.isSaved ? (
                <SavedEventWithPopover event={event} />
              ) : (
                <span className="block truncate">{event.title}</span>
              ),
          }}
          eventPropGetter={(event: { isSaved?: boolean }) => ({
            style: {
              backgroundColor: event.isSaved ? "#0d9488" : "#f5f5f4",
              border: event.isSaved ? "none" : "1px solid #e7e5e4",
              borderRadius: "6px",
              color: event.isSaved ? "white" : "#44403c",
              fontWeight: 500,
              fontSize: "12px",
              padding: "2px 8px",
            },
          })}
          dayPropGetter={(date: Date) => {
            const day = date.getDay();
            if (day === 0 || day === 6) {
              return { style: { backgroundColor: "#fafaf9" } };
            }
            return {};
          }}
          onSelectEvent={(calEvent: { id: string }) => {
            const raw = eventsList.find((e: { id: string }) => e.id === calEvent.id);
            if (raw) {
              const n = normalizeEvent(raw as Record<string, unknown>);
              setSelectedEvent({
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
              });
            }
          }}
        />
        {events.length === 0 && effectiveCalendarMode === "saved" && (
          <div className="pointer-events-none absolute inset-x-0 top-40 mx-auto w-fit rounded-lg border border-stone-200 bg-white/95 px-4 py-3 text-sm text-stone-600 shadow-sm">
            No events in My Calendar yet.
          </div>
        )}
      </div>
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
