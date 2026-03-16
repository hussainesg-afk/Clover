"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import LoginHomePage from "@/components/LoginHomePage";
import ProfileSidebar from "@/components/ProfileSidebar";
import { normalizeEvent } from "@/lib/event-normalizer";
import { filterEventsWithDebug } from "@/lib/filter-events";
import type { Event } from "@/components/EventCard";
import CloverIcon from "@/components/CloverIcon";
import WeatherWidget from "@/components/WeatherWidget";
import UpNextCard from "@/components/UpNextCard";
import { useChosenEvents } from "@/lib/use-chosen-events";

function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";
  const part = email.split("@")[0];
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function getUserPostcode(
  userId: string | undefined,
  responses: { questionId: string; selectedOptionIds: string | string[]; userId?: string; createdAt?: number }[]
): string | undefined {
  if (!userId) return undefined;
  const postcodeResponses = responses
    .filter((r) => r.userId === userId && r.questionId === "postcode")
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const postcodeResponse = postcodeResponses[0];
  if (!postcodeResponse) return undefined;
  const val = postcodeResponse.selectedOptionIds;
  const str = Array.isArray(val) ? val[0] : val;
  return typeof str === "string" ? str.trim() : undefined;
}

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading: authLoading, user } = db.useAuth();
  const { isLoading, error, data } = db.useQuery({ events: {} });
  const { data: responsesData } = db.useQuery({ questionnaire_responses: {} });

  const curatedEvents = useMemo(() => {
    if (!user?.id) return [];
    const raw = (data?.events ?? []) as Event[];
    const responses = (responsesData?.questionnaire_responses ?? []) as {
      questionId: string;
      selectedOptionIds: string | string[];
      userId: string;
      createdAt?: number;
      lat?: number;
      lng?: number;
    }[];
    const myResponses = responses.filter((r) => r.userId === user.id);
    if (myResponses.length === 0) return [];
    const result = filterEventsWithDebug(
      raw,
      myResponses.map((r) => ({
        questionId: r.questionId,
        selectedOptionIds: r.selectedOptionIds,
        createdAt: r.createdAt,
        lat: r.lat,
        lng: r.lng,
      }))
    );
    return result.events;
  }, [user?.id, responsesData?.questionnaire_responses, data?.events]);

  const greetingName = getGreetingName(user?.email);

  const responses = (responsesData?.questionnaire_responses ?? []) as {
    questionId: string;
    selectedOptionIds: string | string[];
    userId?: string;
    createdAt?: number;
  }[];
  const userPostcode = getUserPostcode(user?.id, responses);

  const rawEvents = data?.events ?? [];
  const events = rawEvents.map((raw: Record<string, unknown>) => normalizeEvent(raw));
  const { nextEvent, laterEvents } = useChosenEvents(events, curatedEvents);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LoginHomePage userType="community" />;
  }

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

  const discoverPicks = curatedEvents.slice(0, 3);
  const activityCount = Math.min(events.length, 7);

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header: greeting + profile */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-stone-200/80 transition hover:ring-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Open profile menu"
          >
            <CloverIcon size={20} className="text-teal-600" />
          </button>
          <h1 className="text-lg font-semibold text-stone-800">
            {greetingName ? `Hello, ${greetingName}` : "Hello"}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-stone-200/80 transition hover:ring-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Open profile menu"
        >
          <svg className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>

      {/* Welcome message with clover graphic and weather */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-white/60 p-6 shadow-sm ring-1 ring-stone-200/60 backdrop-blur-sm sm:p-8">
        <div
          className="absolute -right-4 -top-4 h-40 w-40 opacity-[0.12]"
          aria-hidden
        >
          <CloverIcon size={160} className="text-teal-600" />
        </div>
        <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold leading-tight text-stone-800 sm:text-3xl">
            Everyone&apos;s
            <br />
            Welcome,
            <br />
            <span className="text-teal-700">Especially</span>
            <br />
            <span className="text-teal-700">You.</span>
          </h2>
          <div className="flex flex-1 items-center justify-center">
            <WeatherWidget />
          </div>
        </div>
      </div>

      {/* Card grid: Activity, Discover in row 1; Up Next and Entertainment full width */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Activity card */}
        <Link
          href="/activity"
          className="group flex flex-col rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-5 text-white shadow-lg transition hover:shadow-xl"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">This Week</span>
          <h3 className="mt-1 text-xl font-bold">Activity</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/95">
            You completed {activityCount} activities. Here&apos;s the real impact that&apos;s had on your health.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <CloverIcon size={18} className="text-white" />
            </div>
            <span className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-medium transition group-hover:bg-white/30">
              →
            </span>
          </div>
        </Link>

        {/* Discover card */}
        <Link
          href="/for-you/top-picks"
          className="group flex flex-col rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg transition hover:shadow-xl"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">Personalised</span>
          <h3 className="mt-1 text-xl font-bold">Discover</h3>
          <ul className="mt-3 flex-1 space-y-2">
            {discoverPicks.map((e, i) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: ["#facc15", "#ef4444", "#38bdf8"][i] ?? "#fff",
                    }}
                  />
                  {e.title.length > 20 ? `${e.title.slice(0, 18)}...` : e.title}
                </span>
                <span className="text-white/80">0.{4 + i} mi</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/90">
              {curatedEvents.length > 0 ? `${curatedEvents.length} new picks` : "Complete questionnaire for picks"}
            </span>
            <span className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-medium transition group-hover:bg-white/30">
              →
            </span>
          </div>
        </Link>

        {/* Up Next - full width row */}
        <div className="sm:col-span-2">
          <UpNextCard
            nextEvent={nextEvent}
            laterEvents={laterEvents}
            userPostcode={userPostcode}
          />
        </div>

        {/* Entertainment card */}
        <div className="group flex flex-col rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-white shadow-lg transition hover:shadow-xl sm:col-span-2">
          <Link href="/entertainment" className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-white/70">Personalised</span>
            <h3 className="mt-1 text-lg font-bold">Entertainment</h3>
          </Link>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {[
              { label: "Daily Challenges", href: "/entertainment#daily-challenges" },
              { label: "Endless puzzles", href: "/entertainment#endless-puzzles" },
              { label: "Play against others", href: "/entertainment#play-against" },
              { label: "Reading & Podcasts", href: "/entertainment#reading" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-2 py-2 text-center text-xs font-semibold transition hover:bg-white/20"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Link
              href="/entertainment"
              className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-medium transition hover:bg-white/30"
            >
              →
            </Link>
          </div>
        </div>
      </div>

      <ProfileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
    </div>
  );
}
