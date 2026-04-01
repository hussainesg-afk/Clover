"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import EventCard, { type Event } from "@/components/EventCard";
import EventDetailModal from "@/components/EventDetailModal";
import { EVENT_BOOKING_SOURCE_SOLO } from "@/lib/event-bookings";
import EventSearchBar from "@/components/EventSearchBar";
import { filterEventsWithDebug } from "@/lib/filter-events";
import { filterEventsBySearch } from "@/lib/filter-events-by-search";
import { normalizeEvent } from "@/lib/event-normalizer";
import AuthGate from "@/components/AuthGate";
import LoadingScreen from "@/components/LoadingScreen";

function SoloTopPicksContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const user = db.useUser();
  const userId = user?.id;

  const { isLoading: eventsLoading, data: eventsData } = db.useQuery({ solo_events: {} });
  const { isLoading: responsesLoading, data: responsesData } = db.useQuery({
    questionnaire_responses: {},
  });

  const { filteredEvents, debugInfo } = useMemo(() => {
    if (!userId) return { filteredEvents: [], debugInfo: null };
    const rawSoloEvents = (eventsData?.solo_events ?? []) as Record<string, unknown>[];
    const events = rawSoloEvents.map((raw) => normalizeEvent(raw)) as Event[];
    const responses = (responsesData?.questionnaire_responses ?? []) as {
      questionId: string;
      selectedOptionIds: string | string[];
      userId: string;
      createdAt?: number;
      lat?: number;
      lng?: number;
    }[];
    const myResponses = responses.filter((r) => r.userId === userId);
    if (myResponses.length === 0) {
      return { filteredEvents: [], debugInfo: null };
    }
    const result = filterEventsWithDebug(
      events,
      myResponses.map((r) => ({
        questionId: r.questionId,
        selectedOptionIds: r.selectedOptionIds,
        createdAt: r.createdAt,
        lat: r.lat,
        lng: r.lng,
      }))
    );
    return { filteredEvents: result.events, debugInfo: result.debug };
  }, [eventsData?.solo_events, responsesData?.questionnaire_responses, userId]);

  const isLoading = eventsLoading || responsesLoading;

  const hasResponses = (responsesData?.questionnaire_responses ?? []).some(
    (r: { userId?: string }) => r.userId === userId
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!hasResponses) {
    return (
      <div className="min-h-screen bg-stone-100">
        <Link
          href="/for-you/solo"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          ← Back to Solo
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">Solo - Top Picks</h1>
        <p className="mt-2 text-stone-600">
          Solo activities matched to your taste and habits.
        </p>
        <div className="mt-8 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-12 text-center text-stone-600 shadow-sm">
          <p className="font-medium">Complete the questionnaire to see your personalised solo picks</p>
          <p className="mt-2 text-sm">
            <Link
              href="/questionnaire"
              className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
            >
              Find Your Events →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100">
        <Link
          href="/for-you/solo"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          ← Back to Solo
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">Solo - Top Picks</h1>
        <p className="mt-2 text-stone-600">
          Solo activities matched to your taste and habits.
        </p>
        <div className="mt-8 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-12 text-center text-stone-600 shadow-sm">
          <p className="font-medium">No solo events match your preferences yet</p>
          <p className="mt-2 text-sm">
            <Link
              href="/questionnaire"
              className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
            >
              Update your preferences →
            </Link>
          </p>
        </div>
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
      <h1 className="text-2xl font-bold text-stone-900">Solo - Top Picks</h1>
      <p className="mt-2 text-stone-600">
        Solo activities matched to your taste and habits.
      </p>
      {debugInfo?.matchMode === "close" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          No perfect matches found. Here are some solo events close to your preferences you might enjoy.
        </p>
      )}
      <EventSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search solo events..."
        className="mt-6"
      />
      <div className="mt-6 space-y-4">
        {filterEventsBySearch(filteredEvents, searchQuery).map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEventClick={setSelectedEvent}
          />
        ))}
      </div>
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          eventSource={EVENT_BOOKING_SOURCE_SOLO}
        />
      )}
    </div>
  );
}

export default function SoloTopPicksPage() {
  return (
    <AuthGate>
      <SoloTopPicksContent />
    </AuthGate>
  );
}
