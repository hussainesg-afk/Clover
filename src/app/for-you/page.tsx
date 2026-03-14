"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { filterEventsWithDebug } from "@/lib/filter-events";
import AuthGate from "@/components/AuthGate";
import CuratedEventsMap from "@/components/CuratedEventsMap";
import EventDetailModal from "@/components/EventDetailModal";
import type { Event } from "@/components/EventCard";

const categoryCards = [
  {
    title: "Top picks",
    description: "Curated activities matched to your taste and habits.",
    bgColor: "#E9693B",
    href: "/for-you/top-picks",
  },
  {
    title: "What others do",
    description: "Trending now in your area - see what's popular nearby.",
    bgColor: "#8B4DCC",
    href: "#",
  },
  {
    title: "Solo",
    description: "Make the most of your own time with activities built for one.",
    bgColor: "#2CA3BF",
    href: "/for-you/solo",
  },
  {
    title: "Browse all",
    description: "Open-ended? Explore everything Clover has to offer.",
    bgColor: "#378D63",
    href: "/for-you/browse",
  },
];

const nearYouFilters = [
  { id: "all", label: "All", icon: null, active: true },
  { id: "events", label: "Events", icon: "trophy" },
  { id: "meetups", label: "Meet-ups", icon: "people" },
  { id: "solo", label: "Solo", icon: "camera" },
  { id: "music", label: "Mus", icon: "headphones" },
];

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  );
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v13zm10 0a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v13a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
  );
}

function FilterIcon({ type }: { type: string }) {
  const iconClass = "h-4 w-4 shrink-0";
  switch (type) {
    case "trophy":
      return <TrophyIcon className={iconClass} />;
    case "people":
      return <PeopleIcon className={iconClass} />;
    case "camera":
      return <CameraIcon className={iconClass} />;
    case "headphones":
      return <HeadphonesIcon className={iconClass} />;
    default:
      return null;
  }
}

function ForYouContent() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const user = db.useUser();
  const userId = user?.id;

  const { isLoading: eventsLoading, data: eventsData } = db.useQuery({ events: {} });
  const { isLoading: responsesLoading, data: responsesData } = db.useQuery({
    questionnaire_responses: {},
  });

  const curatedEvents = useMemo(() => {
    if (!userId) return [];
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
    if (myResponses.length === 0) return [];
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
    return result.events;
  }, [eventsData?.events, responsesData?.questionnaire_responses, userId]);

  const mapEvents = curatedEvents.slice(0, 12);
  const isLoadingMap = eventsLoading || responsesLoading;

  const userLocation = useMemo(() => {
    const responses = (responsesData?.questionnaire_responses ?? []) as {
      questionId: string;
      userId: string;
      lat?: number;
      lng?: number;
      createdAt?: number;
    }[];
    const postcodeRes = responses
      .filter((r) => r.userId === userId && r.questionId === "postcode")
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0];
    if (!postcodeRes?.lat || !postcodeRes?.lng) return null;
    return { lat: postcodeRes.lat, lng: postcodeRes.lng };
  }, [responsesData?.questionnaire_responses, userId]);

  return (
    <div className="min-h-screen bg-stone-100">
      {/* 2x2 Category cards */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        {categoryCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex flex-col rounded-3xl p-5 text-white shadow-lg transition hover:shadow-xl"
            style={{ backgroundColor: card.bgColor }}
          >
            <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-white/95">{card.description}</p>
            <div className="mt-4 flex justify-end">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-lg font-medium transition group-hover:bg-white/35">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Near you section */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-stone-800">Near you</h2>
        <div className="mb-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {nearYouFilters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
                }`}
              >
                {filter.icon && <FilterIcon type={filter.icon} />}
                {filter.label}
              </button>
            );
          })}
        </div>
        {isLoadingMap ? (
          <div
            className="flex min-h-[280px] items-center justify-center rounded-3xl text-stone-500"
            style={{ backgroundColor: "#E0E7C7" }}
          >
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
          </div>
        ) : (
          <CuratedEventsMap
            events={mapEvents}
            maxMarkers={12}
            userLocation={userLocation ?? undefined}
            onEventClick={setSelectedEvent}
          />
        )}
      </section>
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
