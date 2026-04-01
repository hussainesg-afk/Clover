"use client";

import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import EventCard, { type Event } from "@/components/EventCard";
import EventDetailModal from "@/components/EventDetailModal";
import { normalizeEvent } from "@/lib/event-normalizer";
import HostAuthGate from "@/components/HostAuthGate";
import LoadingScreen from "@/components/LoadingScreen";

function MyEventsContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { user } = db.useAuth();
  const { isLoading, error, data } = db.useQuery({ events: {} });

  const rawEvents = (data?.events ?? []) as Array<Record<string, unknown> & { id: string; organizerId?: string }>;
  const myEvents = rawEvents
    .filter((e) => e.organizerId === user?.id)
    .map((raw) => normalizeEvent(raw)) as Event[];

  const handleRemove = async (eventId: string) => {
    if (!confirm("Are you sure? This will remove the event from the site.")) return;
    setRemovingId(eventId);
    try {
      await db.transact([db.tx.events[eventId].delete()]);
      setSelectedEvent((prev) => (prev?.id === eventId ? null : prev));
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-red-700 shadow-sm">
        <p className="font-medium">Connection error</p>
        <p className="mt-1 text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <Link
        href="/host"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        Back to Host Dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My posted events</h1>
          <p className="mt-1 text-stone-600">
            Events you&apos;ve added. Remove them if you need to cancel.
          </p>
        </div>
        <Link
          href="/host/add-event"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
        >
          Add event
        </Link>
      </div>

      {myEvents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center text-stone-500 shadow-sm">
          <p className="font-medium">You haven&apos;t posted any events yet</p>
          <p className="mt-1 text-sm">
            Add your first event to appear on the community events list.
          </p>
          <Link
            href="/host/add-event"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            Add event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <EventCard
                  event={event}
                  onEventClick={setSelectedEvent}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(event.id)}
                disabled={removingId === event.id}
                className="shrink-0 self-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 sm:self-auto"
              >
                {removingId === event.id ? "Removing..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
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

export default function MyEventsPage() {
  return (
    <HostAuthGate>
      <MyEventsContent />
    </HostAuthGate>
  );
}
