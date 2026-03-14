"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import AuthGate from "@/components/AuthGate";
import RouteMap from "@/components/RouteMap";
import {
  SOLO_ROUTES,
  type SoloRoute,
  type RouteType,
} from "@/config/solo-routes.config";

type FilterType = "all" | "run" | "walk" | "cycle";
type DistanceFilter = "all" | "short" | "medium" | "long";

function matchesDistance(route: SoloRoute, filter: DistanceFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "short":
      return route.distanceKm < 5;
    case "medium":
      return route.distanceKm >= 5 && route.distanceKm <= 10;
    case "long":
      return route.distanceKm > 10;
    default:
      return true;
  }
}

function SoloFitnessContent() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("all");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const user = db.useUser();
  const userId = user?.id;
  const { data: responsesData } = db.useQuery({
    questionnaire_responses: {},
  });

  const userLocation = useMemo(() => {
    if (!userId) return null;
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

  const filteredRoutes = useMemo(() => {
    return SOLO_ROUTES.filter((route) => {
      const matchesType =
        typeFilter === "all" || route.type === (typeFilter as RouteType);
      const matchesDist = matchesDistance(route, distanceFilter);
      return matchesType && matchesDist;
    });
  }, [typeFilter, distanceFilter]);

  const handleRouteClick = useCallback((route: SoloRoute) => {
    setSelectedRouteId((prev) => (prev === route.id ? null : route.id));
    const cardEl = cardsRef.current?.querySelector(
      `[data-route-id="${route.id}"]`
    );
    cardEl?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, []);

  return (
    <div className="min-h-screen bg-stone-100">
      <Link
        href="/for-you/solo"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← Back to Solo
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Solo fitness</h1>
        <p className="mt-1 text-stone-600">
          Discover local running, walking and cycling routes near you.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Type
          </p>
          <div className="flex flex-wrap gap-2">
            {(["all", "run", "walk", "cycle"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTypeFilter(f)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  typeFilter === f
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
                }`}
              >
                {f === "all" ? "All" : f === "run" ? "Running" : f === "walk" ? "Walking" : "Cycling"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Distance
          </p>
          <div className="flex flex-wrap gap-2">
            {(["all", "short", "medium", "long"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setDistanceFilter(f)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  distanceFilter === f
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "short"
                    ? "Under 5 km"
                    : f === "medium"
                      ? "5–10 km"
                      : "10+ km"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mb-6">
        <RouteMap
          routes={filteredRoutes}
          userLocation={userLocation ?? undefined}
          selectedRouteId={selectedRouteId}
        />
      </div>

      {/* Route cards */}
      <div ref={cardsRef} className="space-y-4">
        <h2 className="text-lg font-bold text-stone-800">Routes near Bristol</h2>
        {filteredRoutes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center text-stone-500 shadow-sm">
            <p className="font-medium">No routes match your filters</p>
            <p className="mt-1 text-sm">Try adjusting the type or distance filters above.</p>
          </div>
        ) : (
          filteredRoutes.map((route) => (
            <button
              key={route.id}
              type="button"
              data-route-id={route.id}
              onClick={() => handleRouteClick(route)}
              className={`block w-full rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                selectedRouteId === route.id
                  ? "border-teal-500 ring-2 ring-teal-200"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-stone-900">{route.name}</h3>
                  {route.description && (
                    <p className="mt-1 text-sm text-stone-500">{route.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`rounded-xl px-3 py-1 text-xs font-medium ${
                        route.type === "run"
                          ? "bg-cyan-100 text-cyan-800"
                          : route.type === "walk"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {route.type === "run" ? "Running" : route.type === "walk" ? "Walking" : "Cycling"}
                    </span>
                    <span className="rounded-xl bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                      {route.distanceKm} km
                    </span>
                  </div>
                </div>
                <span className="shrink-0 rounded-xl bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                  {selectedRouteId === route.id ? "Selected" : "View on map"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function SoloFitnessPage() {
  return (
    <AuthGate>
      <SoloFitnessContent />
    </AuthGate>
  );
}
