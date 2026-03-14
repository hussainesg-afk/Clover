"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayViewF,
  OVERLAY_LAYER,
} from "@react-google-maps/api";
import EventCard, { type Event } from "./EventCard";
import { format } from "date-fns";
import { parseEventDateTime } from "@/lib/parse-event-date";

const mapContainerStyle = {
  width: "100%",
  height: "320px",
  borderRadius: "1rem",
};

const defaultCenter = { lat: 51.5074, lng: -0.1278 };

interface CuratedEventsMapProps {
  events: Event[];
  maxMarkers?: number;
  userLocation?: { lat: number; lng: number };
  onEventClick?: (event: Event) => void;
}

type EventWithCoords = Event & { lat: number; lng: number };

function getCategoryGradient(category: string): string {
  const gradients = [
    "from-teal-400 to-emerald-500",
    "from-amber-400 to-orange-500",
    "from-violet-400 to-purple-500",
    "from-cyan-400 to-sky-500",
    "from-rose-400 to-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash += category.charCodeAt(i);
  return gradients[Math.abs(hash) % gradients.length];
}

/** Airbnb-style pin: white rounded tag with event name */
function EventPin({
  event,
  isSelected,
  onClick,
}: {
  event: Event;
  isSelected: boolean;
  onClick: () => void;
}) {
  const label = event.title.length > 24 ? `${event.title.slice(0, 22)}…` : event.title;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`cursor-pointer select-none rounded-xl border-2 px-3 py-1.5 text-sm font-semibold shadow-md transition-all hover:scale-105 ${
        isSelected
          ? "border-teal-500 bg-white ring-2 ring-teal-300"
          : "border-stone-200 bg-white text-stone-800 hover:border-stone-300"
      }`}
      style={{ whiteSpace: "nowrap", maxWidth: "180px" }}
    >
      {label}
    </button>
  );
}

/** Compact Airbnb-style card for horizontal strip */
function MapEventCard({
  event,
  isSelected,
  onClick,
}: {
  event: Event;
  isSelected: boolean;
  onClick: () => void;
}) {
  const gradient = event.primaryCategory
    ? getCategoryGradient(event.primaryCategory)
    : "from-teal-400 to-emerald-500";

  let dateStr = "";
  if (event.startDateTime) {
    const d = parseEventDateTime(event.startDateTime);
    dateStr = d ? format(d, "EEE, MMM d") : event.startDateTime;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 flex-col overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition-all ${
        isSelected
          ? "border-teal-500 ring-2 ring-teal-200"
          : "border-stone-200 hover:border-stone-300"
      }`}
      style={{ width: "220px" }}
    >
      <div
        className={`h-24 w-full bg-gradient-to-br ${gradient}`}
        aria-hidden
      />
      <div className="p-3">
        <h3 className="truncate font-semibold text-stone-900">{event.title}</h3>
        <p className="mt-0.5 truncate text-xs text-stone-500">
          {event.venueName || dateStr || "Event"}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {event.primaryCategory && (
            <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
              {event.primaryCategory}
            </span>
          )}
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
              event.costType === "Free"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {event.costType || "Paid"}
          </span>
        </div>
      </div>
    </button>
  );
}

const pinOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -height,
});

/** Offset ~15m so pins at same location don't stack; returns { lat, lng } */
function positionWithStackOffset(
  events: EventWithCoords[],
  index: number
): { lat: number; lng: number } {
  const e = events[index];
  const base = { lat: e.lat, lng: e.lng };
  const samePos = events
    .slice(0, index)
    .filter((o) => o.lat === e.lat && o.lng === e.lng).length;
  if (samePos === 0) return base;
  const step = 0.00015;
  const angle = (samePos * 72 * Math.PI) / 180;
  return {
    lat: base.lat + step * Math.cos(angle),
    lng: base.lng + step * Math.sin(angle),
  };
}

export default function CuratedEventsMap({
  events,
  maxMarkers = 5,
  userLocation,
  onEventClick,
}: CuratedEventsMapProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
  });

  const eventsWithCoords = useMemo(() => {
    return events.filter(
      (e): e is EventWithCoords =>
        typeof e.lat === "number" && typeof e.lng === "number"
    );
  }, [events]);

  const toShow = eventsWithCoords.slice(0, maxMarkers);

  const hasMapData = apiKey && isLoaded && !loadError && toShow.length > 0;
  const isMapLoading = apiKey && !isLoaded && !loadError && toShow.length > 0;

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation;
    if (toShow.length === 0) return defaultCenter;
    const avgLat = toShow.reduce((s, e) => s + e.lat, 0) / toShow.length;
    const avgLng = toShow.reduce((s, e) => s + e.lng, 0) / toShow.length;
    return { lat: avgLat, lng: avgLng };
  }, [userLocation, toShow]);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      const bounds = new google.maps.LatLngBounds();
      if (userLocation) bounds.extend(userLocation);
      toShow.forEach((e) => bounds.extend({ lat: e.lat, lng: e.lng }));
      if (bounds.isEmpty()) return;
      mapInstance.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    },
    [toShow, userLocation]
  );

  const onUnmount = useCallback(() => setMap(null), []);

  const handleCardClick = useCallback(
    (event: Event) => {
      setSelectedEventId(event.id);
      const withCoords = event as EventWithCoords;
      if (
        map &&
        typeof withCoords.lat === "number" &&
        typeof withCoords.lng === "number"
      ) {
        map.panTo({ lat: withCoords.lat, lng: withCoords.lng });
        map.setZoom(14);
      }
      const cardEl = cardsRef.current?.querySelector(
        `[data-event-id="${event.id}"]`
      );
      cardEl?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    [map]
  );

  const handleMarkerClick = useCallback((event: Event) => {
    setSelectedEventId(event.id);
    const cardEl = cardsRef.current?.querySelector(
      `[data-event-id="${event.id}"]`
    );
    cardEl?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, []);

  // Fallback: no events
  if (events.length === 0) {
    return (
      <Link
        href="/questionnaire"
        className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-3xl text-stone-500 transition hover:bg-stone-200/30"
        style={{ backgroundColor: "#E0E7C7" }}
      >
        <span className="text-sm">
          Complete the questionnaire to see events near you
        </span>
      </Link>
    );
  }

  // Loading: map script loading
  if (isMapLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {toShow.map((event) => (
            <MapEventCard
              key={event.id}
              event={event}
              isSelected={false}
              onClick={() => onEventClick?.(event)}
            />
          ))}
        </div>
        <div
          className="flex min-h-[320px] items-center justify-center rounded-2xl border border-stone-200 bg-stone-50"
          style={{ backgroundColor: "#E0E7C7" }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  // Fallback: no map (no API key, not loaded, or no coords) – show cards only
  if (!hasMapData) {
    return (
      <div
        className="space-y-3 rounded-3xl p-4"
        style={{ backgroundColor: "#E0E7C7" }}
      >
        <p className="text-sm font-medium text-stone-700">Your top picks</p>
        <div className="space-y-2">
          {events.slice(0, 5).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEventClick={onEventClick}
            />
          ))}
        </div>
        <Link
          href="/for-you/top-picks"
          className="block text-center text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          View all top picks →
        </Link>
      </div>
    );
  }

  // Airbnb-style: horizontal cards + interactive map with event name pins
  return (
    <div className="space-y-4">
      {/* Horizontal scrollable cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        <div ref={cardsRef} className="flex gap-4">
          {toShow.map((event) => (
            <div key={event.id} data-event-id={event.id}>
              <MapEventCard
                event={event}
                isSelected={selectedEventId === event.id}
                onClick={() => handleCardClick(event)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Interactive map */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "transit",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {/* User location pin (your postcode) */}
          {userLocation && (
            <OverlayViewF
              mapPaneName={OVERLAY_LAYER}
              position={userLocation}
              getPixelPositionOffset={(w, h) => ({ x: -(w / 2), y: -h })}
            >
              <div className="rounded-lg border-2 border-teal-500 bg-teal-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                You
              </div>
            </OverlayViewF>
          )}

          {/* Event pins - Airbnb-style white tags with event names */}
          {toShow.map((event, idx) => (
            <OverlayViewF
              key={event.id}
              mapPaneName={OVERLAY_LAYER}
              position={positionWithStackOffset(toShow, idx)}
              getPixelPositionOffset={pinOffset}
            >
              <EventPin
                event={event}
                isSelected={selectedEventId === event.id}
                onClick={() => handleMarkerClick(event)}
              />
            </OverlayViewF>
          ))}
        </GoogleMap>
      </div>

      <Link
        href="/for-you/top-picks"
        className="block text-center text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        View all top picks →
      </Link>
    </div>
  );
}
