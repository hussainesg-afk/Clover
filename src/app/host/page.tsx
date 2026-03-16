"use client";

import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import LoginHomePage from "@/components/LoginHomePage";
import CloverIcon from "@/components/CloverIcon";

function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";
  const part = email.split("@")[0];
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

export default function HostPage() {
  const { isLoading: authLoading, user } = db.useAuth();
  const { isLoading, error, data } = db.useQuery({ events: {} });

  const rawEvents = data?.events ?? [];
  const eventCount = Array.isArray(rawEvents) ? rawEvents.length : 0;
  const greetingName = getGreetingName(user?.email);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LoginHomePage userType="host" />;
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

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-800">
          {greetingName ? `Hello, ${greetingName}` : "Host Dashboard"}
        </h1>
      </div>

      {/* Welcome card */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-white/60 p-6 shadow-sm ring-1 ring-stone-200/60 backdrop-blur-sm sm:p-8">
        <div
          className="absolute -right-4 -top-4 h-40 w-40 opacity-[0.12]"
          aria-hidden
        >
          <CloverIcon size={160} className="text-teal-600" />
        </div>
        <div className="relative">
          <h2 className="text-2xl font-bold leading-tight text-stone-800 sm:text-3xl">
            Your Host
            <br />
            <span className="text-teal-700">Dashboard</span>
          </h2>
          <p className="mt-3 text-stone-600">
            Manage your venue and see what&apos;s happening locally.
          </p>
        </div>
      </div>

      {/* Card grid - similar to community but host-focused */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/host/add-event"
          className="group flex flex-col rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg transition hover:shadow-xl"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">Submit</span>
          <h3 className="mt-1 text-xl font-bold">Add event</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/95">
            Post a new event to the community list. Fill in the questionnaire to add your event.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-medium transition group-hover:bg-white/30">
              →
            </span>
          </div>
        </Link>

        <Link
          href="/host/my-events"
          className="group flex flex-col rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white shadow-lg transition hover:shadow-xl"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">Manage</span>
          <h3 className="mt-1 text-xl font-bold">My posted events</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/95">
            View and manage events you&apos;ve added. Remove them if you need to cancel.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-medium transition group-hover:bg-white/30">
              →
            </span>
          </div>
        </Link>

        <Link
          href="/host/events"
          className="group flex flex-col rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-5 text-white shadow-lg transition hover:shadow-xl"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">Browse</span>
          <h3 className="mt-1 text-xl font-bold">Events</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/95">
            Browse {eventCount} community events in Bristol. See what&apos;s on and find opportunities to collaborate.
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

        <Link
          href="/host/calendar"
          className="group flex flex-col rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg transition hover:shadow-xl"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">Schedule</span>
          <h3 className="mt-1 text-xl font-bold">Calendar</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/95">
            View events on the calendar. Plan your venue schedule and see what&apos;s happening when.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-medium transition group-hover:bg-white/30">
              →
            </span>
          </div>
        </Link>

        <Link
          href="/host/your-voice"
          className="group flex flex-col rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg transition hover:shadow-xl sm:col-span-2"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">Community</span>
          <h3 className="mt-1 text-xl font-bold">Your Voice</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/95">
            See what the community is sharing. Posts, feedback, and conversations from event-goers and hosts.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-medium transition group-hover:bg-white/30">
              →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
