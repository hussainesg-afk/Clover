"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import HostAuthGate from "@/components/HostAuthGate";
import LoadingScreen from "@/components/LoadingScreen";
import { geocodePostcode } from "@/lib/geocode-postcode";
import {
  ORGANISER_EVENT_QUESTIONS,
  ORGANISER_QUESTION_TO_EVENT_FIELD,
} from "@/config/organiser-event-questions.config";

const BS3_CENTRE = { lat: 51.44, lng: -2.6 };

function AddEventFormInner({ userId }: { userId: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setPostcodeError(null);
  };

  const handleSingleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostcodeError(null);

    const required = ORGANISER_EVENT_QUESTIONS.filter((q) => q.required);
    const missing = required.find((q) => !(answers[q.id] ?? "").trim());
    if (missing) {
      setPostcodeError(`Please fill in: ${missing.text}`);
      return;
    }

    setSubmitted(true);

    const postcodeStr = (answers["postCode"] ?? "").trim();
    let lat = BS3_CENTRE.lat;
    let lng = BS3_CENTRE.lng;

    if (postcodeStr) {
      const coords = await geocodePostcode(postcodeStr);
      if (!coords) {
        setPostcodeError("Please enter a valid UK postcode");
        setSubmitted(false);
        return;
      }
      lat = coords.lat;
      lng = coords.lng;
    }

    const payload: Record<string, unknown> = {
      organizerId: userId,
      lat,
      lng,
    };

    for (const q of ORGANISER_EVENT_QUESTIONS) {
      const field = ORGANISER_QUESTION_TO_EVENT_FIELD[q.id];
      if (!field) continue;

      const val = answers[q.id];
      if (q.type === "text") {
        payload[field] = val?.trim() ?? "";
      } else {
        const str = typeof val === "string" ? val.trim() : "";
        if (str && str !== "Not applicable" && str !== "Not specified") {
          payload[field] = str;
        }
      }
    }

    await db.transact([db.tx.events[id()].update(payload)]);
    setSubmitted(false);
    router.replace("/host/my-events");
  };

  const q = ORGANISER_EVENT_QUESTIONS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === ORGANISER_EVENT_QUESTIONS.length - 1;
  const accentColors = [
    "border-l-teal-500",
    "border-l-cyan-500",
    "border-l-violet-500",
    "border-l-orange-500",
    "border-l-emerald-500",
  ];
  const accent = accentColors[currentIndex % accentColors.length];

  const goNext = () => {
    if (isLast) return;
    setCurrentIndex((i) => Math.min(i + 1, ORGANISER_EVENT_QUESTIONS.length - 1));
  };

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const currentVal = answers[q.id] ?? "";

  const TEXT_PLACEHOLDERS: Record<string, string> = {
    description: "e.g. A fun community coffee morning...",
    startDateTime: "e.g. 15 Mar 2025, 2pm",
    postCode: "e.g. BS1 2AB",
  };

  return (
    <div>
      <Link
        href="/host"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        Back to Host Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Add an event</h1>
        <p className="mt-1 text-stone-600">
          Fill in the details below. Your event will appear on the community events list.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-medium text-stone-500">
          Step {currentIndex + 1} of {ORGANISER_EVENT_QUESTIONS.length}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / ORGANISER_EVENT_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {postcodeError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            {postcodeError}
          </div>
        )}

        <div
          key={q.id}
          className={`rounded-2xl border border-stone-200 border-l-4 bg-white p-6 shadow-sm ${accent}`}
        >
          <h3 className="text-lg font-semibold text-stone-900">{q.text}</h3>
          {q.required && (
            <span className="ml-1 text-sm text-stone-500">(required)</span>
          )}
          <div className="mt-4 space-y-2">
            {q.type === "text" ? (
              q.id === "description" ? (
                <textarea
                  value={currentVal}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder={TEXT_PLACEHOLDERS[q.id]}
                  rows={4}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-700 placeholder:text-stone-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              ) : (
                <input
                  type="text"
                  value={currentVal}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder={TEXT_PLACEHOLDERS[q.id]}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-700 placeholder:text-stone-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              )
            ) : (
              q.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    currentVal === opt.id
                      ? "border-teal-300 bg-teal-50/50"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.id}
                    checked={currentVal === opt.id}
                    onChange={() => handleSingleSelect(q.id, opt.id)}
                    className="h-4 w-4 text-teal-600"
                  />
                  <span className="text-stone-700">{opt.label}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-3 font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {isLast ? (
            <button
              type="submit"
              disabled={submitted}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-medium text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 transition"
            >
              {submitted ? "Publishing..." : "Publish event"}
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-medium text-white shadow-md hover:from-teal-600 hover:to-cyan-600 transition"
            >
              Next
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function AddEventForm() {
  const user = db.useUser();

  if (!user?.id) {
    return <LoadingScreen />;
  }

  return <AddEventFormInner userId={user.id} />;
}

export default function AddEventPage() {
  return (
    <HostAuthGate>
      <AddEventForm />
    </HostAuthGate>
  );
}
