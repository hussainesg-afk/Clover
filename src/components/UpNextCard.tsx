"use client";

import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { parseEventDateTime } from "@/lib/parse-event-date";
import EventDetailModal from "@/components/EventDetailModal";
import type { Event } from "@/components/EventCard";

type WeatherData = {
  temp: number;
  description: string;
  icon: string;
  city: string;
};

type TrafficAlert = {
  minutes: number;
  title: string;
  description: string;
} | null;

function CloudRainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 0012.75 15h-1.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v.01M12 21v.01M15 21v.01M15 18v.01M9 21v.01M9 18v.01" />
    </svg>
  );
}

function getWeatherNotice(weather: WeatherData): string {
  const desc = weather.description.toLowerCase();
  if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower")) {
    return "Rain expected. Pack an umbrella for your return journey.";
  }
  if (desc.includes("snow")) {
    return "Snow expected. Wrap up warm and allow extra travel time.";
  }
  if (desc.includes("cloud") && !desc.includes("clear")) {
    return "Cloudy today. A light jacket may be useful.";
  }
  return `Clear conditions in ${weather.city}. Enjoy your day.`;
}

function formatEventTime(startDateTime?: string, durationMinutes = 60): string {
  const start = parseEventDateTime(startDateTime ?? "");
  if (!start) return "";
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
}

function getDirectionsUrl(
  event: Event,
  originPostcode?: string
): string {
  const destination = [event.venueName, event.address, event.postCode]
    .filter(Boolean)
    .join(", ");
  if (!destination && !event.lat) return "";
  const dest = destination || (event.lat != null && event.lng != null ? `${event.lat},${event.lng}` : "");
  if (!dest) return "";
  if (originPostcode?.trim()) {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originPostcode.trim())}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`;
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function DirectionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

const LATER_ACCENT_COLORS = ["border-l-violet-400", "border-l-rose-400", "border-l-stone-300"];

interface UpNextCardProps {
  nextEvent: Event | null;
  laterEvents: Event[];
  userPostcode?: string;
}

function UpNextCardContent({ nextEvent, laterEvents, userPostcode }: UpNextCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [traffic, setTraffic] = useState<TrafficAlert>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Weather unavailable");
        return data;
      })
      .then((data) => {
        setWeather({
          temp: data.temp,
          description: data.description,
          icon: data.icon,
          city: data.city,
        });
      })
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, []);

  useEffect(() => {
    // TODO: Replace with traffic API when ready.
    setTraffic({
      minutes: 25,
      title: "Traffic Alert",
      description: "Heavy congestion near Stokes Croft. Leave 5 mins earlier to avoid delays.",
    });
  }, []);

  const smartPrepContent = (
    <div className="mt-6 space-y-4">
      {traffic && (
        <div className="flex gap-4 rounded-xl bg-orange-100/95 p-4">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-500 text-white">
            <span className="text-lg font-bold leading-none">{traffic.minutes}</span>
            <span className="text-[10px] font-medium">mins</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-900">{traffic.title}</p>
            <p className="mt-0.5 text-sm text-stone-700">{traffic.description}</p>
          </div>
        </div>
      )}
      {weatherLoading ? (
        <div className="flex gap-4 rounded-xl bg-orange-100/95 p-4">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-orange-200/80" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-orange-200/80" />
            <div className="h-3 w-32 animate-pulse rounded bg-orange-200/60" />
          </div>
        </div>
      ) : weather ? (
        <div className="flex gap-4 rounded-xl bg-orange-100/95 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
            <CloudRainIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-900">Weather Notice</p>
            <p className="mt-0.5 text-sm text-stone-700">{getWeatherNotice(weather)}</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 rounded-xl bg-orange-100/95 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-stone-400 text-white">
            <CloudRainIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-900">Weather Notice</p>
            <p className="mt-0.5 text-sm text-stone-700">Weather unavailable. Check again later.</p>
          </div>
        </div>
      )}
      {laterEvents.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-semibold text-white/90">Later</h4>
          <div className="flex gap-4 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
            {laterEvents.map((event, i) => {
              const timeStr = formatEventTime(event.startDateTime);
              const accentClass = LATER_ACCENT_COLORS[i % LATER_ACCENT_COLORS.length];
              return (
                <div
                  key={event.id}
                  className={`min-w-[180px] shrink-0 rounded-xl border-l-4 border border-orange-200/80 bg-orange-100/95 p-4 ${accentClass}`}
                >
                  <p className="font-semibold text-stone-900">{event.title}</p>
                  {timeStr && <p className="mt-0.5 text-xs text-stone-600">{timeStr}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (!nextEvent) {
    return (
      <div className="flex flex-col rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white shadow-lg">
        <span className="text-sm font-medium text-white/70">Up Next</span>
        <p className="mt-4 text-lg font-semibold">No upcoming events</p>
        <p className="mt-2 text-sm text-white/90">
          Add events from Discover or your calendar to see them here.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/for-you/top-picks"
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-white/20 py-5 transition hover:bg-white/30"
          >
            <span className="text-2xl font-bold text-orange-600">+</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-900">
              Discover
            </span>
          </Link>
          <Link
            href="/calendar"
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-white/20 py-5 transition hover:bg-white/30"
          >
            <span className="text-2xl font-bold text-orange-600">+</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-900">
              Calendar
            </span>
          </Link>
        </div>
        {smartPrepContent}
        {laterEvents.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-white/90">Later</h4>
            <div className="flex gap-4 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {laterEvents.map((event, i) => {
                const timeStr = formatEventTime(event.startDateTime);
                const accentClass = LATER_ACCENT_COLORS[i % LATER_ACCENT_COLORS.length];
                return (
                  <div
                    key={event.id}
                    className={`min-w-[180px] shrink-0 rounded-xl border-l-4 border border-orange-200/80 bg-orange-100/95 p-4 ${accentClass}`}
                  >
                    <p className="font-semibold text-stone-900">{event.title}</p>
                    {timeStr && <p className="mt-0.5 text-xs text-stone-600">{timeStr}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const start = parseEventDateTime(nextEvent.startDateTime ?? "");
  const timeStr = formatEventTime(nextEvent.startDateTime);
  const countdown = start && start > new Date()
    ? `Starts ${formatDistanceToNow(start, { addSuffix: true })}`
    : null;
  const location = [nextEvent.venueName, nextEvent.postCode].filter(Boolean).join(", ");
  const directionsUrl = getDirectionsUrl(nextEvent, userPostcode);

  return (
    <>
      <div className="flex flex-col rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white shadow-lg">
        <span className="text-sm font-medium text-white/70">Up Next</span>
        <h3 className="mt-3 text-2xl font-bold leading-tight">{nextEvent.title}</h3>
        {location && (
          <p className="mt-2 text-sm text-white/90">{location}</p>
        )}
        {countdown && (
          <p className="mt-3 text-base font-bold text-amber-200">{countdown}</p>
        )}
        {timeStr && (
          <p className="mt-1 text-sm text-white/90">{timeStr}</p>
        )}

        <div className="mt-8 flex gap-4">
          {nextEvent.bookingUrl && (
            <a
              href={nextEvent.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-white/20 py-5 transition hover:bg-white/30"
            >
              <PhoneIcon className="h-6 w-6 text-orange-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-900">
                Book
              </span>
            </a>
          )}
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-white/20 py-5 transition hover:bg-white/30"
            >
              <DirectionsIcon className="h-6 w-6 text-orange-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-900">
                Directions
              </span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-white/20 py-5 transition hover:bg-white/30"
          >
            <ArrowRightIcon className="h-6 w-6 text-orange-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-900">
              View Event
            </span>
          </button>
        </div>

        {smartPrepContent}
      </div>

      {showModal && (
        <EventDetailModal
          event={{
            ...nextEvent,
            postCode: nextEvent.postCode,
            description: nextEvent.description,
            lat: nextEvent.lat,
            lng: nextEvent.lng,
            accessibility: nextEvent.accessibility,
            primaryCategory: nextEvent.primaryCategory,
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

interface UpNextCardPropsWithEvents {
  nextEvent: Event | null;
  laterEvents: Event[];
  userPostcode?: string;
}

export default function UpNextCard({
  nextEvent,
  laterEvents,
  userPostcode,
}: UpNextCardPropsWithEvents) {
  return (
    <UpNextCardContent nextEvent={nextEvent} laterEvents={laterEvents} userPostcode={userPostcode} />
  );
}
