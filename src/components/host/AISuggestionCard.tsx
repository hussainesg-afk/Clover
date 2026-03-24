"use client";

import { useState } from "react";
import { id as instantId } from "@instantdb/react";
import { db } from "@/lib/db";
import { geocodePostcode } from "@/lib/geocode-postcode";
import type { AISuggestion } from "@/app/api/host/ai-suggestions/route";

const CATEGORY_STYLES: Record<string, string> = {
  Wellness: "bg-emerald-100 text-emerald-800",
  Social: "bg-sky-100 text-sky-800",
  Fitness: "bg-rose-100 text-rose-800",
  Learning: "bg-amber-100 text-amber-800",
  Crafts: "bg-violet-100 text-violet-800",
  Music: "bg-indigo-100 text-indigo-800",
  Food: "bg-orange-100 text-orange-800",
  Games: "bg-teal-100 text-teal-800",
};

const TAG_STYLES: Record<string, string> = {
  Ticketed: "bg-rose-100 text-rose-700",
  "Free Entry": "bg-emerald-100 text-emerald-700",
  "High Demand": "bg-amber-100 text-amber-700",
  Trending: "bg-sky-100 text-sky-700",
  "Community Value": "bg-violet-100 text-violet-700",
  Popular: "bg-sky-100 text-sky-700",
};

const AVATAR_COLORS = [
  "bg-emerald-200 text-emerald-800",
  "bg-amber-200 text-amber-800",
  "bg-sky-200 text-sky-800",
  "bg-rose-200 text-rose-800",
  "bg-violet-200 text-violet-800",
];

function confidenceColor(val: number): string {
  if (val >= 85) return "bg-emerald-500";
  if (val >= 70) return "bg-teal-500";
  if (val >= 50) return "bg-amber-500";
  return "bg-rose-400";
}

function cardBorderColor(category: string): string {
  switch (category) {
    case "Wellness": return "border-l-emerald-400";
    case "Social": return "border-l-sky-400";
    case "Fitness": return "border-l-rose-400";
    case "Learning": return "border-l-amber-400";
    case "Crafts": return "border-l-violet-400";
    case "Music": return "border-l-indigo-400";
    case "Food": return "border-l-orange-400";
    case "Games": return "border-l-teal-400";
    default: return "border-l-stone-300";
  }
}

function inferPriceBand(ticketPrice: string): string {
  if (/free/i.test(ticketPrice)) return "Free";
  const match = ticketPrice.match(/(\d+)/);
  if (!match) return "Not specified";
  const n = parseInt(match[1], 10);
  if (n <= 5) return "Under £5";
  if (n <= 10) return "£5-10";
  if (n <= 20) return "£10-20";
  return "£20+";
}

function inferDurationBand(suggestedTime: string): string {
  const parts = suggestedTime.split("-").map((s) => s.trim());
  if (parts.length !== 2) return "1-2 hours";
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const diff = toMin(parts[1]) - toMin(parts[0]);
  if (diff <= 60) return "Under 1 hour";
  if (diff <= 120) return "1-2 hours";
  return "2-4 hours";
}

function inferEventTime(suggestedTime: string): string {
  const match = suggestedTime.match(/(\d{1,2})/);
  if (!match) return "Daytime (9am-5pm)";
  const hour = parseInt(match[1], 10);
  if (hour < 12) return "Morning (before noon)";
  if (hour < 17) return "Daytime (9am-5pm)";
  return "Evening (after 5pm)";
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  hostId: string;
  onHosted?: () => void;
}

export default function AISuggestionCard({
  suggestion,
  hostId,
  onHosted,
}: AISuggestionCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [hosting, setHosting] = useState(false);
  const [hosted, setHosted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [postCode, setPostCode] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  const handleHost = async () => {
    if (!venueName.trim() || !postCode.trim()) {
      setError("Venue name and postcode are required.");
      return;
    }

    setHosting(true);
    setError(null);

    try {
      const coords = await geocodePostcode(postCode.trim());

      const isFree =
        suggestion.ticketPrice === "Free" ||
        suggestion.ticketPrice.toLowerCase().includes("free");

      const startTime = suggestion.suggestedTime.split("-")[0]?.trim() ?? "";
      const startDateTime = `${suggestion.suggestedDate}, ${startTime}`;

      const eventId = instantId();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = {
        organizerId: hostId,
        title: suggestion.title,
        description: suggestion.description,
        primaryCategory: suggestion.category,
        startDateTime,
        costType: isFree ? "Free events only" : suggestion.ticketPrice,
        priceBand: inferPriceBand(suggestion.ticketPrice),
        socialLevel: "Moderately social",
        tags: suggestion.tags.join(", "),
        venueName: venueName.trim(),
        address: address.trim() || undefined,
        postCode: postCode.trim().toUpperCase(),
        eventTime: inferEventTime(suggestion.suggestedTime),
        durationBand: inferDurationBand(suggestion.suggestedTime),
        eventFormat: "In person",
      };

      if (bookingUrl.trim()) {
        payload.bookingUrl = bookingUrl.trim();
      }

      if (coords) {
        payload.lat = coords.lat;
        payload.lng = coords.lng;
      }

      await db.transact([db.tx.events[eventId].update(payload)]);

      setHosted(true);
      onHosted?.();
    } catch {
      setError("Failed to create event. Please try again.");
    } finally {
      setHosting(false);
    }
  };

  const fakeAvatars = Array.from(
    { length: Math.min(suggestion.localsSearching, 4) },
    (_, i) =>
      String.fromCharCode(
        65 + ((i * 7 + suggestion.title.charCodeAt(0)) % 26),
      ),
  );

  return (
    <article
      className={`flex flex-col rounded-2xl border border-l-4 border-stone-200 bg-white shadow-sm transition hover:shadow-md ${cardBorderColor(suggestion.category)}`}
    >
      <div className="flex-1 p-5">
        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              CATEGORY_STYLES[suggestion.category] ?? "bg-stone-100 text-stone-700"
            }`}
          >
            {suggestion.category}
          </span>
          {suggestion.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                TAG_STYLES[tag] ?? "bg-stone-100 text-stone-600"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title & description */}
        <h3 className="text-lg font-bold text-stone-900">{suggestion.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600">
          {suggestion.description}
        </p>

        {/* Date / time / price / size */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Date</p>
              <p className="text-sm font-medium text-stone-800">{suggestion.suggestedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Time</p>
              <p className="text-sm font-medium text-stone-800">{suggestion.suggestedTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Ticket Price</p>
              <p className="text-sm font-medium text-stone-800">{suggestion.ticketPrice}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Target Size</p>
              <p className="text-sm font-medium text-stone-800">{suggestion.targetSize}</p>
            </div>
          </div>
        </div>

        {/* Locals interested */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {fakeAvatars.map((letter, i) => (
              <div
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold ${
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
          <span className="text-xs font-medium text-stone-500">
            {suggestion.localsSearching} local{suggestion.localsSearching !== 1 ? "s" : ""} interested
          </span>
        </div>

        {/* Booking confidence */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Booking Confidence
            </p>
            <p className={`text-sm font-bold ${suggestion.bookingConfidence >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
              {suggestion.bookingConfidence}%
            </p>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${confidenceColor(suggestion.bookingConfidence)}`}
              style={{ width: `${suggestion.bookingConfidence}%` }}
            />
          </div>
        </div>

        {/* Details panel */}
        {showDetails && (
          <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-stone-700">Full Description</h4>
            <p className="text-sm text-stone-600">{suggestion.description}</p>
            <div className="mt-3 space-y-1 border-t border-stone-200 pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                How we calculated this
              </p>
              <p className="text-xs text-stone-500">
                Based on {suggestion.sourcePostIds.length} voice post{suggestion.sourcePostIds.length !== 1 ? "s" : ""} requesting this activity
              </p>
              <p className="text-xs text-stone-500">
                {suggestion.localsSearching} local{suggestion.localsSearching !== 1 ? "s" : ""} expressed interest (posts + upvotes)
              </p>
              <p className="text-xs text-stone-500">
                Confidence accounts for demand volume, engagement, request specificity, and recency
              </p>
            </div>
          </div>
        )}

        {/* Venue details form */}
        {showForm && !hosted && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-stone-800">
              Add your venue details
            </h4>
            <div className="space-y-3">
              <div>
                <label htmlFor={`venue-${suggestion.title}`} className="mb-1 block text-xs font-medium text-stone-600">
                  Venue name *
                </label>
                <input
                  id={`venue-${suggestion.title}`}
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. The Old Bookshop"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor={`address-${suggestion.title}`} className="mb-1 block text-xs font-medium text-stone-600">
                  Address
                </label>
                <input
                  id={`address-${suggestion.title}`}
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 65 North Street, Bedminster"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor={`postcode-${suggestion.title}`} className="mb-1 block text-xs font-medium text-stone-600">
                  Postcode *
                </label>
                <input
                  id={`postcode-${suggestion.title}`}
                  type="text"
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  placeholder="e.g. BS3 1JG"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor={`booking-${suggestion.title}`} className="mb-1 block text-xs font-medium text-stone-600">
                  Booking URL (optional)
                </label>
                <input
                  id={`booking-${suggestion.title}`}
                  type="url"
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  placeholder="e.g. https://eventbrite.co.uk/my-event"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {error && (
              <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
            )}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleHost}
                disabled={hosting}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {hosting ? "Creating event..." : "Confirm & publish event"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revenue / cost / setup footer */}
      <div className="border-t border-stone-100 px-5 py-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Est. Revenue</p>
            <p className="text-sm font-bold text-emerald-700">{suggestion.estimatedRevenue}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Resource Cost</p>
            <p className="text-sm font-bold text-stone-700">{suggestion.resourceCost}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Setup Time</p>
            <p className="text-sm font-bold text-stone-700">{suggestion.setupTime}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-stone-100">
        <button
          type="button"
          onClick={() => {
            if (!hosted && !showForm) setShowForm(true);
          }}
          disabled={hosting || hosted}
          className={`flex flex-1 items-center justify-center gap-2 rounded-bl-2xl py-3 text-sm font-semibold transition ${
            hosted
              ? "bg-emerald-100 text-emerald-700"
              : showForm
                ? "bg-emerald-50 text-emerald-600"
                : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          }`}
        >
          {hosted ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Event published
            </>
          ) : showForm ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Fill in details above
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Host this event
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-center rounded-br-2xl border-l border-stone-100 bg-white px-6 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          {showDetails ? "Less" : "Details"}
        </button>
      </div>
    </article>
  );
}
