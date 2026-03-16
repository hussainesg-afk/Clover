"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import EventCard, { type Event } from "@/components/EventCard";
import EventDetailModal from "@/components/EventDetailModal";
import EventSearchBar from "@/components/EventSearchBar";
import { normalizeEvent } from "@/lib/event-normalizer";
import { filterEventsBySearch } from "@/lib/filter-events-by-search";
import AuthGate from "@/components/AuthGate";

function SoloBrowseContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, error, data } = db.useQuery({ solo_events: {} });

  const rawEvents = data?.solo_events ?? [];
  const events = useMemo(
    () =>
      rawEvents.map((raw: Record<string, unknown>) =>
        normalizeEvent(raw)
      ) as Event[],
    [rawEvents]
  );
  const filteredEvents = filterEventsBySearch(events, searchQuery);

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

  return (
    <div className="min-h-screen bg-stone-100">
      <Link
        href="/for-you/solo"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← Back to Solo
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Solo events near Bristol</h1>
        <p className="mt-1 text-stone-600">Activities built for one.</p>
      </div>
      <EventSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search solo events..."
        className="mb-6"
      />
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center text-stone-500 shadow-sm">
            <p className="font-medium">
              {searchQuery.trim() ? "No solo events match your search" : "No solo events yet"}
            </p>
            <p className="mt-1 text-sm">
              {searchQuery.trim()
                ? "Try a different search term"
                : "Run the seed script to load solo events from Bristol_100_Solo_Activities_Master.xlsx"}
            </p>
            {!searchQuery.trim() && (
              <p className="mt-2 font-mono text-xs">npx tsx scripts/seed-solo-events.ts</p>
            )}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEventClick={setSelectedEvent}
            />
          ))
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

export default function SoloBrowsePage() {
  return (
    <AuthGate>
      <SoloBrowseContent />
    </AuthGate>
  );
}
