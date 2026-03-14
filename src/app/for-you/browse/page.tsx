"use client";

import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import EventCard, { type Event } from "@/components/EventCard";
import EventDetailModal from "@/components/EventDetailModal";
import { normalizeEvent } from "@/lib/event-normalizer";
import AuthGate from "@/components/AuthGate";

function BrowseContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { isLoading, error, data } = db.useQuery({ events: {} });

  const rawEvents = data?.events ?? [];
  const events = rawEvents.map((raw: Record<string, unknown>) =>
    normalizeEvent(raw)
  ) as Event[];

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
        href="/for-you"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← Back to For You
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Events near Bristol, BS3</h1>
        <p className="mt-1 text-stone-600">Browse community events happening in your area.</p>
      </div>
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center text-stone-500 shadow-sm">
            <p className="font-medium">No events yet</p>
            <p className="mt-1 text-sm">
              Run the seed script to load events from Bristol_200_Community_Events_MASTER_V2.xlsx
            </p>
            <p className="mt-2 font-mono text-xs">npx tsx scripts/seed-events.ts</p>
          </div>
        ) : (
          events.map((event) => (
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

export default function BrowsePage() {
  return (
    <AuthGate>
      <BrowseContent />
    </AuthGate>
  );
}
