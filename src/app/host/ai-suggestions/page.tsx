"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import HostAuthGate from "@/components/HostAuthGate";
import { db } from "@/lib/db";
import QuietSlotManager, { type QuietSlot } from "@/components/host/QuietSlotManager";
import AISuggestionCard from "@/components/host/AISuggestionCard";
import type { AISuggestion } from "@/app/api/host/ai-suggestions/route";

/* ------------------------------------------------------------------ */
/*  Category filter tabs                                               */
/* ------------------------------------------------------------------ */
const CATEGORY_TABS = ["All", "Social", "Wellness", "Fitness", "Free entry"] as const;

/* ------------------------------------------------------------------ */
/*  Mini calendar widget                                               */
/* ------------------------------------------------------------------ */
function MiniCalendar({
  slotDates,
  suggestionDates,
}: {
  slotDates: Set<string>;
  suggestionDates: Set<string>;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();
  const todayDate = now.getDate();

  const cells: (number | null)[] = [
    ...Array.from<null>({ length: startPad }).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const iso = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-stone-900">{monthName}</h3>
      <p className="mb-4 text-xs text-stone-500">Recommended event dates highlighted</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="py-1 font-semibold text-stone-400">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const isoStr = iso(day);
          const isToday = day === todayDate;
          const isSlot = slotDates.has(isoStr);
          const isSuggestion = suggestionDates.has(isoStr);

          let bg = "";
          let text = "text-stone-700";
          if (isToday) {
            bg = "bg-emerald-100";
            text = "text-emerald-800 font-bold";
          }
          if (isSlot) {
            bg = "bg-amber-100";
            text = "text-amber-800 font-bold";
          }
          if (isSuggestion && !isSlot) {
            bg = "bg-sky-100";
            text = "text-sky-800 font-bold";
          }

          return (
            <div
              key={i}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${bg} ${text}`}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="mt-4 space-y-1.5 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-emerald-100" />
          Today
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-amber-100" />
          Quiet slots
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-sky-100" />
          Recommended event dates
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Info cards section                                                 */
/* ------------------------------------------------------------------ */
function HandleHardParts() {
  const items = [
    {
      title: "Organiser matched for you.",
      desc: "Clover connects you with a vetted host who runs the whole event.",
    },
    {
      title: "Ticketing & payments sorted.",
      desc: "We manage sales and reminders. Money in your account within 48hrs.",
    },
    {
      title: "Auto-promoted locally.",
      desc: "Your event goes straight to matched Clover users -- no marketing effort from you.",
    },
    {
      title: "Builds loyal regulars.",
      desc: "One hosted event typically leads to 3x return visits from new guests.",
    },
  ];

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-800 p-6 text-white shadow-sm">
      <h3 className="mb-4 text-lg font-bold">We handle the hard parts</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl bg-stone-700/60 p-4"
          >
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-stone-300">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-stone-200" />
        <div className="h-5 w-14 rounded-full bg-stone-200" />
      </div>
      <div className="h-5 w-3/4 rounded bg-stone-200" />
      <div className="mt-2 h-4 w-full rounded bg-stone-100" />
      <div className="mt-1 h-4 w-2/3 rounded bg-stone-100" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-10 rounded bg-stone-100" />
        <div className="h-10 rounded bg-stone-100" />
        <div className="h-10 rounded bg-stone-100" />
        <div className="h-10 rounded bg-stone-100" />
      </div>
      <div className="mt-4 h-2 rounded-full bg-stone-100" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main content                                                       */
/* ------------------------------------------------------------------ */
function AISuggestionsContent() {
  const user = db.useUser();
  const hostId = user?.id ?? "";

  const { data: slotsData } = db.useQuery({ quiet_slots: {} });
  const allSlots = (slotsData?.quiet_slots ?? []) as unknown as QuietSlot[];
  const hostSlots = useMemo(
    () => allSlots.filter((s) => s.hostId === hostId).sort((a, b) => a.date.localeCompare(b.date)),
    [allSlots, hostId],
  );

  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("All");

  const fetchSuggestions = useCallback(async () => {
    if (!hostId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/host/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          hint?: string;
          missingEnv?: string[];
        };
        const parts = [
          data.error,
          data.hint,
          data.missingEnv?.length
            ? `Missing: ${data.missingEnv.join(", ")}`
            : null,
        ].filter(Boolean);
        throw new Error(parts.join(" ") || "Request failed");
      }
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  // Filter suggestions by selected slot and category
  const filteredSuggestions = useMemo(() => {
    let list = suggestions;

    if (activeSlotId) {
      const slot = hostSlots.find((s) => s.id === activeSlotId);
      if (slot) {
        list = list.filter((s) =>
          s.suggestedDate.toLowerCase().includes(
            new Date(slot.date + "T00:00:00")
              .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
              .toLowerCase(),
          ),
        );
      }
    }

    if (activeCategoryTab !== "All") {
      if (activeCategoryTab === "Free entry") {
        list = list.filter(
          (s) =>
            s.ticketPrice.toLowerCase().includes("free") ||
            s.tags.some((t) => t.toLowerCase().includes("free")),
        );
      } else {
        list = list.filter(
          (s) => s.category.toLowerCase() === activeCategoryTab.toLowerCase(),
        );
      }
    }

    return list;
  }, [suggestions, activeSlotId, activeCategoryTab, hostSlots]);

  // Stats
  const availableSlotCount = hostSlots.filter((s) => s.status === "available").length;
  const totalRevenue = suggestions.reduce((sum, s) => {
    const match = s.estimatedRevenue.match(/[\d,]+/g);
    if (match && match.length > 0) return sum + parseInt(match[match.length - 1].replace(",", ""), 10);
    return sum;
  }, 0);

  const totalLocals = suggestions.reduce((sum, s) => sum + s.localsSearching, 0);
  const uniqueLocals = Math.round(totalLocals * 0.6);

  // Calendar data
  const slotDates = useMemo(
    () => new Set(hostSlots.map((s) => s.date)),
    [hostSlots],
  );
  const suggestionDates = useMemo(() => {
    const dates = new Set<string>();
    for (const s of suggestions) {
      const dateStr = s.suggestedDate;
      const now = new Date();
      const year = now.getFullYear();
      const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
      for (let m = 0; m < months.length; m++) {
        if (dateStr.toLowerCase().includes(months[m])) {
          const dayMatch = dateStr.match(/\d+/);
          if (dayMatch) {
            const day = String(parseInt(dayMatch[0], 10)).padStart(2, "0");
            const month = String(m + 1).padStart(2, "0");
            dates.add(`${year}-${month}-${day}`);
          }
          break;
        }
      }
    }
    return dates;
  }, [suggestions]);

  const formatSlotPill = (s: QuietSlot) => {
    const d = new Date(s.date + "T00:00:00");
    const day = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return `${day} ${s.startTime}-${s.endTime}`;
  };

  return (
    <div>
      <Link
        href="/host"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Host Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Host Recommendations</h1>
          <p className="mt-1 text-stone-600">
            {suggestions.length > 0
              ? `We've matched your quiet slots with community demand nearby -- ${suggestions.length} events ready to go.`
              : "Analyse community voice posts and get AI-powered event suggestions for your venue."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/host/calendar"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Manage calendar
          </Link>
          <QuietSlotManager hostId={hostId} slots={[]} compact />
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{suggestions.length}</p>
              <p className="text-xs text-stone-500">Events recommended</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{availableSlotCount}</p>
              <p className="text-xs text-stone-500">Quiet slots this month</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
              <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                ~{totalRevenue > 0 ? `\u00A3${totalRevenue.toLocaleString()}` : "--"}
              </p>
              <p className="text-xs text-stone-500">Potential monthly earnings</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{uniqueLocals || "--"}</p>
              <p className="text-xs text-stone-500">Locals searching nearby</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiet Slots section */}
      <QuietSlotManager hostId={hostId} slots={hostSlots} />

      {/* Quiet slots filter bar */}
      {hostSlots.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
            <span>Your Quiet Slots</span>
            <span className="text-xs font-normal text-stone-400">
              Select a slot to filter matching events
            </span>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setActiveSlotId(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeSlotId === null
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
              }`}
            >
              All slots
            </button>
            {hostSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActiveSlotId(slot.id === activeSlotId ? null : slot.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeSlotId === slot.id
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${slot.status === "available" ? "bg-emerald-400" : "bg-amber-400"}`} />
                {formatSlotPill(slot)}
                {slot.label && (
                  <span className={`text-xs ${activeSlotId === slot.id ? "text-emerald-200" : "text-amber-600"}`}>
                    {slot.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate / refresh button */}
      {!fetched && !loading && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={fetchSuggestions}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:from-teal-700 hover:to-emerald-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Generate AI Suggestions
          </button>
        </div>
      )}

      {fetched && !loading && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={fetchSuggestions}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm transition hover:bg-stone-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh suggestions
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-rose-700">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchSuggestions}
            className="mt-2 text-sm font-medium text-rose-600 underline hover:text-rose-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Category filter tabs + suggestion cards */}
      {(loading || filteredSuggestions.length > 0) && (
        <>
          <div className="mt-6 mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900">Recommended Events for You</h2>
            <div className="flex gap-1.5 rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCategoryTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    activeCategoryTab === tab
                      ? "bg-stone-800 text-white"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
              <p className="font-medium text-stone-600">
                No suggestions match this filter. Try &quot;All&quot; to see everything.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredSuggestions.map((suggestion, i) => (
                <AISuggestionCard
                  key={`${suggestion.title}-${i}`}
                  suggestion={suggestion}
                  hostId={hostId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Bottom section: info cards + calendar */}
      {fetched && (
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <HandleHardParts />
          <MiniCalendar slotDates={slotDates} suggestionDates={suggestionDates} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper                                                       */
/* ------------------------------------------------------------------ */
export default function AISuggestionsPage() {
  return (
    <HostAuthGate>
      <AISuggestionsContent />
    </HostAuthGate>
  );
}
