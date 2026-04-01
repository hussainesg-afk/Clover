"use client";

import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/db";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, isSameDay } from "date-fns";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getCalendarEventIds, CALENDAR_UPDATED_EVENT } from "@/lib/calendar-events";
import EventDetailModal from "@/components/EventDetailModal";
import LoadingScreen from "@/components/LoadingScreen";
import type { Event } from "@/components/EventCard";
import { normalizeEvent } from "@/lib/event-normalizer";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: string;
  venueDisplay?: string;
  isSaved?: boolean;
}

const DOT_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#8b5cf6"];

function getEventDotsForDay(dayStart: Date, events: CalendarEvent[]): string[] {
  const dayEnd = addDays(dayStart, 1);
  const onDay = events.filter(
    (e) => e.start >= dayStart && e.start < dayEnd
  );
  return onDay.slice(0, 4).map((_, i) => DOT_COLORS[i % DOT_COLORS.length]);
}

function TimelineEventBlock({ event }: { event: CalendarEvent }) {
  const timeStr = `${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`;
  const venue = event.venueDisplay ?? event.resource ?? "";

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900">{event.title}</p>
        {venue && (
          <p className="mt-0.5 truncate text-sm text-stone-600">{venue}</p>
        )}
        <p className="mt-1 text-sm font-semibold text-stone-800">{timeStr}</p>
      </div>
      <span className="mt-auto w-fit rounded-full bg-stone-200/80 px-2.5 py-1 text-xs font-medium text-stone-700">
        Suggested Transport
      </span>
    </div>
  );
}

function MonthEventContent({ event }: { event: CalendarEvent }) {
  return <span className="block truncate">{event.title}</span>;
}

const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarToolbarProps {
  label: string;
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY" | "DATE") => void;
  onView: (view: "month" | "week" | "day" | "agenda") => void;
  view: "month" | "week" | "day" | "agenda";
  onDateSelect: (d: Date) => void;
  events: CalendarEvent[];
}

function CalendarToolbar({
  label,
  date,
  onNavigate,
  onView,
  view,
  onDateSelect,
  events,
}: CalendarToolbarProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];

  const goPrev = () => onNavigate("PREV");
  const goNext = () => onNavigate("NEXT");

  return (
    <div className="mb-6 space-y-5">
      {/* Date header: large day, month, orange + button */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
              aria-label="Previous"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-4xl font-bold leading-none text-stone-800 sm:text-5xl">
                {format(date, "d")}
              </p>
              <p className="mt-1 text-xl font-bold text-stone-800">
                {format(date, "MMMM")}
              </p>
            </div>
            <button
              type="button"
              onClick={goNext}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
              aria-label="Next"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="hidden sm:flex gap-1">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onView(v)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                view === v ? "bg-stone-100 text-stone-900" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Week strip */}
      <div className="border-b border-stone-200">
        <div className="flex">
          {weekDays.map((d, i) => {
            const dots = getEventDotsForDay(d, events);
            const selected = isSameDay(d, date);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onDateSelect(d)}
                className={`flex flex-1 flex-col items-center py-2 transition ${
                  selected ? "bg-stone-100" : "hover:bg-stone-50"
                }`}
              >
                <span className="text-sm font-bold text-stone-800">
                  {dayNames[i]}
                </span>
                <span className="mt-1 text-sm font-medium text-stone-700">
                  {format(d, "d")}
                </span>
                {dots.length > 0 && (
                  <div className="mt-1.5 flex gap-0.5">
                    {dots.map((color, j) => (
                      <span
                        key={j}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile view switcher */}
      <div className="flex sm:hidden gap-1">
        {(["month", "week", "day"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onView(v)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
              view === v ? "bg-stone-100 text-stone-900" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [calendarMode, setCalendarMode] = useState<"saved" | "all">("all");
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [date, setDate] = useState(() => new Date());
  const { user } = db.useAuth();
  const { isLoading, error, data } = db.useQuery({ events: {} });

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
        const venueDisplay = [n.venueName, n.postCode].filter(Boolean).join(", ");
        return {
          id: n.id,
          title: n.title,
          start,
          end,
          resource: n.venueName,
          venueDisplay: venueDisplay || undefined,
          isSaved: savedEventIds.includes(n.id),
        };
      });
  }, [calendarSourceEvents, savedEventIds]);

  const toolbarComponent = useMemo(
    () =>
      (props: {
        label: string;
        date: Date;
        onNavigate: (action: string, date?: Date) => void;
        onView: (view: string) => void;
        view: string;
      }) => (
        <CalendarToolbar
          {...props}
          view={props.view as "month" | "week" | "day" | "agenda"}
          events={events}
          onDateSelect={(d) => (props.onNavigate as (a: string, d?: Date) => void)("DATE", d)}
        />
      ),
    [events]
  );

  if (isLoading) {
    return <LoadingScreen />;
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
      {/* Filter chips - sticky so they stay visible when scrolling on mobile */}
      <div className="sticky top-16 z-10 -mx-4 -mt-6 mb-4 flex flex-wrap gap-2 bg-stone-100/95 px-4 py-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setCalendarMode("all")}
          className={`inline-flex min-h-[44px] min-w-[44px] cursor-pointer touch-manipulation select-none items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
            calendarMode === "all"
              ? "bg-stone-900 text-white"
              : "bg-white text-stone-700 shadow-sm ring-1 ring-stone-200/80 hover:bg-stone-50"
          }`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V8.935M12 12l2 2 4-4" />
          </svg>
          All
        </button>
        <button
          type="button"
          onClick={() => setCalendarMode("saved")}
          className={`inline-flex min-h-[44px] min-w-[44px] cursor-pointer touch-manipulation select-none items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
            calendarMode === "saved"
              ? "bg-stone-900 text-white"
              : "bg-white text-stone-700 shadow-sm ring-1 ring-stone-200/80 hover:bg-stone-50"
          }`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          My Calendar
        </button>
      </div>

      <div className="apple-calendar calendar-design relative h-[680px] overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
          getNow={() => new Date()}
          onNavigate={(newDate: Date) => setDate(newDate)}
          onView={(newView: string) => {
            if (newView === "month" || newView === "week" || newView === "day") setView(newView);
          }}
          components={{
            toolbar: toolbarComponent,
            event: ({ event }: { event: CalendarEvent }) =>
              view === "day" || view === "week" ? (
                <TimelineEventBlock event={event} />
              ) : (
                <MonthEventContent event={event} />
              ),
          }}
          eventPropGetter={(event: { isSaved?: boolean }) => {
            const isSaved = event.isSaved;
            return {
              style: {
                backgroundColor: isSaved ? "#fef2f2" : "#f5f5f4",
                borderLeft: `4px solid ${isSaved ? "#ef4444" : "#44403c"}`,
                border: "none",
                borderRadius: "8px",
                color: "#44403c",
                fontWeight: 500,
                fontSize: "13px",
                padding: 0,
                overflow: "hidden",
              },
            };
          }}
          dayPropGetter={(d: Date) => {
            const day = d.getDay();
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
                lgbtqFocus: n.lgbtqFocus,
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
