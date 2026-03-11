"use client";

import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import EventCard, { type Event } from "@/components/EventCard";
import EventDetailModal from "@/components/EventDetailModal";
import { normalizeEvent } from "@/lib/event-normalizer";

function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";
  const part = email.split("@")[0];
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

export default function HomePage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { user } = db.useAuth();
  const { isLoading, error, data } = db.useQuery({ events: {} });

  const greetingName = getGreetingName(user?.email);

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
        <p className="mt-1 text-sm">Ensure NEXT_PUBLIC_INSTANT_APP_ID is set and the schema is pushed.</p>
      </div>
    );
  }

  const events = data?.events ?? [];

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-50 p-6 shadow-sm">
        <div className="absolute -right-4 -top-4 h-28 w-28 opacity-25" aria-hidden>
          <svg viewBox="0 0 64 64" fill="currentColor" className="text-teal-500">
            <circle cx="32" cy="16" r="12" />
            <circle cx="16" cy="40" r="12" />
            <circle cx="48" cy="40" r="12" />
            <circle cx="32" cy="48" r="12" />
          </svg>
        </div>
        <h1 className="relative text-2xl font-bold text-stone-900">
          {greetingName ? `Hello, ${greetingName}!` : "Hello!"}
        </h1>
        <p className="relative mt-2 text-lg text-stone-600">
          Everyone&apos;s welcome. Especially you.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link
          href="/"
          className="group flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-white shadow-md transition hover:shadow-lg hover:shadow-teal-200/50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/25">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </span>
          <span className="font-semibold">Activity</span>
          <span className="text-sm opacity-90">Browse events</span>
          <span className="mt-auto text-right text-white/80 group-hover:translate-x-1 transition">→</span>
        </Link>
        <Link
          href="/questionnaire"
          className="group flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 p-5 text-white shadow-md transition hover:shadow-lg hover:shadow-cyan-200/50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/25">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <span className="font-semibold">Discover</span>
          <span className="text-sm opacity-90">Find your fit</span>
          <span className="mt-auto text-right text-white/80 group-hover:translate-x-1 transition">→</span>
        </Link>
        <Link
          href="/calendar"
          className="group flex flex-col gap-2 rounded-2xl bg-orange-500 p-5 text-white shadow-md transition hover:shadow-lg"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          <span className="font-semibold">Coming Up</span>
          <span className="text-sm opacity-90">View calendar</span>
          <span className="mt-auto text-right text-white/80 group-hover:translate-x-1 transition">→</span>
        </Link>
        <Link
          href="/for-you"
          className="group flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 text-white shadow-md transition hover:shadow-lg hover:shadow-violet-200/50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/25">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </span>
          <span className="font-semibold">For You</span>
          <span className="text-sm opacity-90">Personalized</span>
          <span className="mt-auto text-right text-white/80 group-hover:translate-x-1 transition">→</span>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-bold text-stone-900">Events near Bristol, BS3</h2>
        <p className="mt-1 text-stone-600">
          Browse community events happening in your area.
        </p>
      </div>
      <div className="mt-6 space-y-4">
        {events.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 p-12 text-center text-stone-600 shadow-sm">
            <p className="font-medium">No events yet</p>
            <p className="mt-1 text-sm">
              Run the seed script to load events from Bristol_200_Community_Events_MASTER_V2.xlsx
            </p>
            <p className="mt-2 text-xs font-mono">
              npx tsx scripts/seed-events.ts
            </p>
          </div>
        ) : (
          events.map((raw: Record<string, unknown>) => {
            const n = normalizeEvent(raw);
            return (
              <EventCard
                key={n.id}
                event={{
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
                }}
                onEventClick={setSelectedEvent}
              />
            );
          })
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
