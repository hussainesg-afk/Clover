"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { getEventImageUrl } from "@/config/event-images.config";
import { addEventToCalendar, isEventInCalendar } from "@/lib/calendar-events";
import {
  EVENT_BOOKING_SOURCE_EVENTS,
  type EventBookingSource,
  type EventBookingRow,
} from "@/lib/event-bookings";
import type { Event } from "./EventCard";

export interface EventDetail extends Event {
  postCode?: string;
  description?: string;
  lat?: number;
  lng?: number;
  accessibility?: string;
  primaryCategory?: string;
}

interface EventDetailModalProps {
  event: EventDetail;
  onClose: () => void;
  /** Which collection this event row comes from (default: main events feed). */
  eventSource?: EventBookingSource;
}

function MapEmbed({
  lat,
  lng,
  addressQuery,
  origin,
}: {
  lat?: number;
  lng?: number;
  addressQuery?: string;
  origin?: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Prefer the actual address for accurate location; fall back to lat/lng
  const hasAddress = addressQuery && addressQuery.trim().length > 0;
  const hasCoords = lat != null && lng != null;

  const destination = hasAddress ? addressQuery!.trim() : (hasCoords ? `${lat},${lng}` : "");
  const searchUrl = hasAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`
    : hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : "";
  // When origin (user postcode) is provided, include it so the route shows from their location
  const directionsUrl = origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;

  if (!hasAddress && !hasCoords) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
        <span className="text-sm">Location map unavailable</span>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="space-y-3">
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl bg-stone-100 text-stone-600">
          <span className="text-sm">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</span>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-teal-600 hover:underline"
          >
            View on Google Maps →
          </a>
        </div>
      </div>
    );
  }

  const q = encodeURIComponent(destination);
  const placeEmbedUrl = hasAddress
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}&zoom=15`
    : `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}&zoom=15&center=${lat},${lng}`;

  const useDirections = origin && origin.trim().length > 0;
  const embedUrl = useDirections
    ? `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin!.trim())}&destination=${encodeURIComponent(destination)}&mode=driving&units=imperial`
    : placeEmbedUrl;

  return (
    <div className="space-y-3">
      {useDirections && (
        <p className="text-xs text-stone-500">Route from your postcode</p>
      )}
      <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
        <iframe
          title={useDirections ? "Route to event" : "Event location map"}
          src={embedUrl}
          className="h-52 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-2.5 text-sm font-medium text-white transition hover:bg-teal-600"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {useDirections ? "Open in Google Maps" : "Get directions (uses your current location)"}
      </a>
    </div>
  );
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

export default function EventDetailModal({
  event,
  onClose,
  eventSource = EVENT_BOOKING_SOURCE_EVENTS,
}: EventDetailModalProps) {
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(() =>
    isEventInCalendar(event.id)
  );

  const user = db.useUser();
  const userId = user?.id;
  const { data: responsesData } = db.useQuery({ questionnaire_responses: {} });
  const { data: bookingsData } = db.useQuery({ event_bookings: {} });
  const responses = (responsesData?.questionnaire_responses ?? []) as {
    questionId: string;
    selectedOptionIds: string | string[];
    userId?: string;
    createdAt?: number;
  }[];
  const userPostcode = useMemo(
    () =>
      getUserPostcode(user?.id, responses),
    [user?.id, responsesData?.questionnaire_responses]
  );

  useEffect(() => {
    setIsAddedToCalendar(isEventInCalendar(event.id));
  }, [event.id]);

  const bookings = (bookingsData?.event_bookings ?? []) as EventBookingRow[];
  const myBooking = useMemo(() => {
    if (!userId) return undefined;
    return bookings.find(
      (b) => b.userId === userId && b.eventId === event.id && b.source === eventSource
    );
  }, [bookings, userId, event.id, eventSource]);

  const [bookingBusy, setBookingBusy] = useState(false);

  const handleMarkGoing = async () => {
    if (!userId || myBooking || bookingBusy) return;
    setBookingBusy(true);
    try {
      const bookingId = id();
      await db.transact([
        db.tx.event_bookings[bookingId].update({
          userId,
          eventId: event.id,
          source: eventSource,
          createdAt: Date.now(),
        }),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setBookingBusy(false);
    }
  };

  const handleRemoveBooking = async () => {
    if (!myBooking || bookingBusy) return;
    setBookingBusy(true);
    try {
      await db.transact([db.tx.event_bookings[myBooking.id].delete()]);
    } catch (e) {
      console.error(e);
    } finally {
      setBookingBusy(false);
    }
  };

  let dateStr = "";
  if (event.startDateTime) {
    const d = parseEventDateTime(event.startDateTime);
    dateStr = d ? format(d, "EEEE, MMMM d 'at' h:mm a") : event.startDateTime;
  }

  const imageUrl = getEventImageUrl(event.primaryCategory);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-teal-200/20">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-stone-600 shadow-md transition hover:bg-white hover:text-stone-900"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="max-h-[90vh] overflow-y-auto">
          <div className="relative h-48 overflow-hidden bg-stone-200">
            <Image
              src={imageUrl}
              alt={event.primaryCategory || "Event"}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 id="event-detail-title" className="text-xl font-bold text-white drop-shadow">
                {event.title}
              </h2>
              {event.primaryCategory && (
                <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-medium text-white backdrop-blur">
                  {event.primaryCategory}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <p className="text-stone-500">{dateStr}</p>
              {event.venueName && (
                <p className="mt-1 font-medium text-stone-900">{event.venueName}</p>
              )}
              {event.address && (
                <p className="text-sm text-stone-600">{event.address}</p>
              )}
              {event.postCode && (
                <p className="mt-1 text-sm font-medium text-stone-700">
                  Post code: {event.postCode}
                </p>
              )}
            </div>

            {event.description && (
              <div>
                <h3 className="text-sm font-semibold text-stone-900">About</h3>
                <p className="mt-1 text-sm text-stone-600 leading-relaxed line-clamp-6">
                  {event.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-2">Location</h3>
              <MapEmbed
                lat={event.lat}
                lng={event.lng}
                addressQuery={[event.venueName, event.address, event.postCode]
                  .filter(Boolean)
                  .join(", ")}
                origin={userPostcode}
              />
            </div>

            {userId && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
                <h3 className="text-sm font-semibold text-stone-900">Your plans</h3>
                {myBooking ? (
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-teal-800">You have marked this as an event you are going to.</p>
                    <button
                      type="button"
                      onClick={handleRemoveBooking}
                      disabled={bookingBusy}
                      className="shrink-0 text-sm font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline disabled:opacity-50"
                    >
                      Not going
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleMarkGoing}
                    disabled={bookingBusy}
                    className="mt-2 w-full rounded-xl bg-stone-900 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
                  >
                    {bookingBusy ? "Saving..." : "I am going"}
                  </button>
                )}
                <p className="mt-2 text-xs text-stone-500">
                  Saved to{" "}
                  <Link href="/my-bookings" className="font-medium text-teal-700 hover:underline">
                    My bookings
                  </Link>
                  . Invite friends from there.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {event.lgbtqFocus && (
                <span className="rounded-xl bg-rose-100 px-3 py-1 text-sm font-medium text-rose-800">
                  LGBTQ+
                </span>
              )}
              {(event.costType || event.priceBand) && (
                <span
                  className={`rounded-xl px-3 py-1 text-sm font-medium ${
                    event.costType === "Free"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {event.costType === "Free"
                    ? "Free"
                    : event.priceBand || event.costType || "Paid"}
                </span>
              )}
              {event.accessibility && (
                <span className="rounded-xl bg-sky-100 px-3 py-1 text-sm text-sky-800">
                  {event.accessibility}
                </span>
              )}
            </div>

            {event.bookingUrl && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={event.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3 text-center font-semibold text-white shadow-md transition hover:from-teal-600 hover:to-emerald-600"
                >
                  Book
                </a>
                <button
                  type="button"
                  onClick={() => {
                    addEventToCalendar(event.id);
                    setIsAddedToCalendar(true);
                  }}
                  className={`w-full rounded-2xl py-3 text-center font-semibold transition ${
                    isAddedToCalendar
                      ? "cursor-default bg-teal-50 text-teal-700"
                      : "border border-teal-500 text-teal-700 hover:bg-teal-50"
                  }`}
                  disabled={isAddedToCalendar}
                >
                  {isAddedToCalendar ? "Added to calendar" : "Add to calendar"}
                </button>
              </div>
            )}
            {!event.bookingUrl && (
              <button
                type="button"
                onClick={() => {
                  addEventToCalendar(event.id);
                  setIsAddedToCalendar(true);
                }}
                className={`block w-full rounded-2xl py-3 text-center font-semibold transition ${
                  isAddedToCalendar
                    ? "cursor-default bg-teal-50 text-teal-700"
                    : "border border-teal-500 text-teal-700 hover:bg-teal-50"
                }`}
                disabled={isAddedToCalendar}
              >
                {isAddedToCalendar ? "Added to calendar" : "Add to calendar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
