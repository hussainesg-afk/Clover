"use client";

import { useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

export interface QuietSlot {
  id: string;
  hostId: string;
  date: string;
  startTime: string;
  endTime: string;
  label?: string | null;
  status: string;
  createdAt: number;
}

interface QuietSlotManagerProps {
  hostId: string;
  slots: QuietSlot[];
  compact?: boolean;
}

export default function QuietSlotManager({
  hostId,
  slots,
  compact = false,
}: QuietSlotManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      setError("Date, start time, and end time are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const slotId = id();
      await db.transact([
        db.tx.quiet_slots[slotId]
          .update({
            hostId,
            date,
            startTime,
            endTime,
            label: label.trim() || undefined,
            status: "available",
            createdAt: Date.now(),
          })
          .link({ host: hostId }),
      ]);
      setDate("");
      setStartTime("");
      setEndTime("");
      setLabel("");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add slot.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    try {
      await db.transact([db.tx.quiet_slots[slotId].delete()]);
    } catch {
      // silently fail
    }
  };

  const formatSlotLabel = (s: QuietSlot) => {
    const d = new Date(s.date + "T00:00:00");
    const day = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return `${day} ${s.startTime}-${s.endTime}`;
  };

  if (compact) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add quiet slot
        </button>
        {showForm && (
          <form onSubmit={handleAdd} className="mt-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                required
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                required
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                required
              />
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (optional)"
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-teal-400 focus:outline-none"
              />
            </div>
            {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900">Your Quiet Slots</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add slot
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 rounded-xl border border-stone-100 bg-stone-50 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Label (optional)</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Very quiet"
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:border-teal-400 focus:outline-none"
              />
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save slot"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="rounded-lg border border-stone-200 px-5 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {slots.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          No quiet slots yet. Add your first one to start getting AI recommendations.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${slot.status === "available" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-sm font-medium text-stone-800">
                  {formatSlotLabel(slot)}
                </span>
                {slot.label && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    {slot.label}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(slot.id)}
                className="rounded-lg p-1.5 text-stone-400 transition hover:bg-rose-50 hover:text-rose-500"
                aria-label="Delete slot"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
