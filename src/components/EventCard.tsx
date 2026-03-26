"use client";

import { format } from "date-fns";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { db } from "@/lib/db";

const CATEGORY_COLORS = [
  "bg-teal-100 text-teal-800",
  "bg-emerald-100 text-emerald-800",
  "bg-cyan-100 text-cyan-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-purple-100 text-purple-800",
  "bg-amber-100 text-amber-800",
  "bg-orange-100 text-orange-800",
  "bg-rose-100 text-rose-800",
  "bg-lime-100 text-lime-800",
] as const;

function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash += category.charCodeAt(i);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition ${filled ? "fill-teal-600 text-teal-600" : "text-stone-400"}`}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      />
    </svg>
  );
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDateTime?: string;
  venueName?: string;
  address?: string;
  postCode?: string;
  costType?: string;
  priceBand?: string;
  primaryCategory?: string;
  bookingUrl?: string;
  lat?: number;
  lng?: number;
  accessibility?: string;
  lgbtqFocus?: string;
  likedBy?: { id: string }[];
}

interface EventCardProps {
  event: Event;
  onEventClick?: (event: Event) => void;
  currentUserId?: string | null;
}

export default function EventCard({ event, onEventClick, currentUserId }: EventCardProps) {
  const likers = event.likedBy ?? [];
  const likeCount = likers.length;
  const hasLiked = currentUserId ? likers.some((u) => u.id === currentUserId) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUserId) return;
    try {
      if (hasLiked) {
        await db.transact(db.tx.events[event.id].unlink({ likedBy: currentUserId }));
      } else {
        await db.transact(db.tx.events[event.id].link({ likedBy: currentUserId }));
      }
    } catch {
      // Ignore errors for now
    }
  };

  let dateStr = "";
  if (event.startDateTime) {
    const d = parseEventDateTime(event.startDateTime);
    dateStr = d ? format(d, "EEE, MMM d · h:mm a") : event.startDateTime;
  }

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-stone-900">{event.title}</h3>
          <p className="mt-1 text-sm text-stone-500">{dateStr}</p>
          {event.venueName && (
            <p className="mt-0.5 text-sm text-stone-600">
              {event.venueName}
              {event.address && ` · ${event.address}`}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {event.primaryCategory && (
              <span className={`inline-block rounded-xl px-3 py-1 text-xs font-medium ${getCategoryColor(event.primaryCategory)}`}>
                {event.primaryCategory}
              </span>
            )}
            {event.lgbtqFocus && (
              <span className="inline-block rounded-xl bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800">
                LGBTQ+
              </span>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-xl px-3 py-1 text-xs font-medium ${
            event.costType === "Free"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {event.costType || "Paid"}
        </span>
      </div>
      {event.likedBy !== undefined && (
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="text-xs text-stone-500">
            {likeCount === 0
              ? "Be the first to like this"
              : `${likeCount} ${likeCount === 1 ? "person" : "people"} liked this`}
          </span>
          <button
            data-like-btn
            type="button"
            onClick={handleLike}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              hasLiked
                ? "bg-teal-50 text-teal-700"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50"
            }`}
            aria-pressed={hasLiked}
            aria-label={hasLiked ? "Unlike event" : "Like event"}
          >
            <HeartIcon filled={hasLiked} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
        </div>
      )}
    </>
  );

  const cardClassName =
    "block w-full rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-200 hover:shadow-md hover:shadow-teal-100/50 cursor-pointer";

  if (onEventClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-like-btn]')) return;
          onEventClick(event);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if ((e.target as HTMLElement).closest('[data-like-btn]')) return;
            e.preventDefault();
            onEventClick(event);
          }
        }}
        className={cardClassName}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cardClassName}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-like-btn]')) return;
        if (event.bookingUrl) window.open(event.bookingUrl, '_blank', 'noopener,noreferrer');
      }}
    >
      {content}
    </div>
  );
}
