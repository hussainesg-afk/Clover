"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import EventCard, { type Event } from "@/components/EventCard";
import EventDetailModal from "@/components/EventDetailModal";
import { filterEventsWithDebug } from "@/lib/filter-events";
import AuthGate from "@/components/AuthGate";

function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";
  const part = email.split("@")[0];
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function ForYouContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const user = db.useUser();
  const greetingName = getGreetingName(user?.email);
  const userId = user?.id;

  const { isLoading: eventsLoading, data: eventsData } = db.useQuery({ events: {} });
  const { isLoading: responsesLoading, data: responsesData } = db.useQuery({
    questionnaire_responses: {},
  });

  const { filteredEvents, debugInfo } = useMemo(() => {
    if (!userId) return { filteredEvents: [], debugInfo: null };
    const events = (eventsData?.events ?? []) as Event[];
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
  }, [eventsData?.events, responsesData?.questionnaire_responses, userId]);

  const isLoading = eventsLoading || responsesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const hasResponses = (responsesData?.questionnaire_responses ?? []).some(
    (r: { userId?: string }) => r.userId === userId
  );

  if (!hasResponses || filteredEvents.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {greetingName ? `Hello, ${greetingName}!` : "Hello!"}
        </h1>
        <p className="mt-2 text-lg text-stone-600">
          Events tailored to your preferences
        </p>
        <div className="mt-8 rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-12 text-center text-stone-600 shadow-sm">
          <p className="font-medium">
            {!hasResponses
              ? "Complete the questionnaire to see personalized events"
              : "No events match your preferences yet"}
          </p>
          <p className="mt-2 text-sm">
            <Link href="/questionnaire" className="font-medium text-violet-600 hover:text-violet-700 hover:underline">
              Find Your Events →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">
        {greetingName ? `Hello, ${greetingName}!` : "Hello!"}
      </h1>
      <p className="mt-2 text-lg text-stone-600">
        Events that match your preferences
      </p>
      {debugInfo?.matchMode === "close" && (
        <p className="mt-2 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          No perfect matches found. Here are some events close to your preferences you might enjoy.
        </p>
      )}
      <div className="mt-6 space-y-4">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEventClick={setSelectedEvent}
          />
        ))}
      </div>
      {process.env.NODE_ENV !== "production" && debugInfo && (
        <details className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700 shadow-sm">
          <summary className="cursor-pointer font-medium">Debug: why these events matched</summary>
          <p className="mt-2">
            Activity filter:{" "}
            {debugInfo.hardFilters.activityCategories.length > 0
              ? debugInfo.hardFilters.activityCategories.join(", ")
              : "none"}
            {" · "}
            Spending: {debugInfo.hardFilters.spendingChoice ?? "none"}
            {debugInfo.hardFilters.eventTimingSlots.length > 0 && (
              <>
                {" · "}
                When: {debugInfo.hardFilters.eventTimingSlots.join(", ")}
              </>
            )}
            {debugInfo.hardFilters.distanceFilter && (
              <>
                {" · "}
                Distance:{" "}
                {debugInfo.hardFilters.distanceFilter.maxMiles === -1
                  ? "Online only"
                  : `within ${debugInfo.hardFilters.distanceFilter.maxMiles} mile${debugInfo.hardFilters.distanceFilter.maxMiles !== 1 ? "s" : ""}${debugInfo.hardFilters.distanceFilter.userPostcode ? ` from ${debugInfo.hardFilters.distanceFilter.userPostcode}` : ""}`}
              </>
            )}
          </p>
          <div className="mt-2 space-y-1">
            {debugInfo.matches.slice(0, 5).map((m) => (
              <p key={m.eventId}>
                <span className="font-medium">{m.title}</span> — score {m.score} (
                {m.matchedQuestionIds.join(", ") || "no scored dimensions"})
              </p>
            ))}
          </div>
        </details>
      )}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export default function ForYouPage() {
  return (
    <AuthGate>
      <ForYouContent />
    </AuthGate>
  );
}
