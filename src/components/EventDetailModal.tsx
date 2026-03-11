"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { getEventImageUrl } from "@/config/event-images.config";
import { addEventToCalendar, isEventInCalendar } from "@/lib/calendar-events";
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

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(() =>
    isEventInCalendar(event.id)
  );

  const user = db.useUser();
  const { data: responsesData } = db.useQuery({ questionnaire_responses: {} });
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

            <div className="flex flex-wrap gap-3">
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
