"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { QUESTIONNAIRE_QUESTIONS } from "@/config/questions.config";
import { geocodePostcode } from "@/lib/geocode-postcode";
import AuthGate from "@/components/AuthGate";
import LoadingScreen from "@/components/LoadingScreen";

type ResponseRow = {
  id: string;
  questionId: string;
  selectedOptionIds: string | string[];
  lat?: number;
  lng?: number;
  userId?: string;
  createdAt?: number;
};

function buildAnswersFromResponses(responses: ResponseRow[]): Record<string, string | string[]> {
  const byQuestion = new Map<string, ResponseRow>();
  for (const r of responses) {
    const existing = byQuestion.get(r.questionId);
    if (!existing || (r.createdAt ?? 0) > (existing.createdAt ?? 0)) {
      byQuestion.set(r.questionId, r);
    }
  }
  const answers: Record<string, string | string[]> = {};
  for (const [, r] of byQuestion) {
    const val = r.selectedOptionIds;
    // Text questions store as single string; normalize from array
    if (Array.isArray(val) && val.length === 1 && typeof val[0] === "string") {
      answers[r.questionId] = val[0];
    } else {
      answers[r.questionId] = val;
    }
  }
  return answers;
}

type UserLocationRow = { id: string; userId: string; lat: number; lng: number };

function QuestionnaireFormInner({
  userId,
  myResponses,
  myUserLocation,
}: {
  userId: string;
  myResponses: ResponseRow[];
  myUserLocation: UserLocationRow | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() =>
    buildAnswersFromResponses(myResponses)
  );
  const [submitted, setSubmitted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const qCurrent = QUESTIONNAIRE_QUESTIONS[currentIndex];
  useEffect(() => {
    if (qCurrent?.type !== "slider") return;
    setAnswers((prev) => {
      const cur = prev[qCurrent.id];
      if (cur !== undefined && cur !== "") return prev;
      const mid = Math.round(((qCurrent.sliderMin ?? 1) + (qCurrent.sliderMax ?? 10)) / 2);
      return { ...prev, [qCurrent.id]: String(mid) };
    });
  }, [currentIndex, qCurrent?.id, qCurrent?.type, qCurrent?.sliderMin, qCurrent?.sliderMax]);

  const handleSingleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleMultiSelect = (questionId: string, optionId: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) ?? [];
      const next = checked
        ? [...current, optionId]
        : current.filter((x) => x !== optionId);
      return { ...prev, [questionId]: next };
    });
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setPostcodeError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostcodeError(null);
    setSubmitted(true);

    const postcodeVal = answers["postcode"];
    const postcodeStr = typeof postcodeVal === "string" ? postcodeVal.trim() : "";
    let postcodeCoords: { lat: number; lng: number } | null = null;

    if (postcodeStr) {
      postcodeCoords = await geocodePostcode(postcodeStr);
      if (!postcodeCoords) {
        setPostcodeError("Please enter a valid UK postcode");
        setSubmitted(false);
        return;
      }
    }

    const deleteTxs = myResponses.map((r) => db.tx.questionnaire_responses[r.id].delete());
    const insertTxs = Object.entries(answers).map(([questionId, selectedOptionIds]) => {
      const payload: Record<string, unknown> = {
        questionId,
        selectedOptionIds: Array.isArray(selectedOptionIds) ? selectedOptionIds : [selectedOptionIds],
        userId,
        createdAt: Date.now(),
      };
      if (questionId === "postcode" && postcodeCoords) {
        payload.lat = postcodeCoords.lat;
        payload.lng = postcodeCoords.lng;
      }
      return db.tx.questionnaire_responses[id()].update(payload);
    });

    const locationTxs = [
      ...(myUserLocation ? [db.tx.user_locations[myUserLocation.id].delete()] : []),
      ...(postcodeCoords
        ? [
            db.tx.user_locations[id()].update({
              userId,
              lat: postcodeCoords.lat,
              lng: postcodeCoords.lng,
            }),
          ]
        : []),
    ];

    const tx = [...deleteTxs, ...insertTxs, ...locationTxs];
    if (tx.length > 0) {
      await db.transact(tx);
    }

    setSubmitted(false);
    setSaveSuccess(true);
  };

  const handleResetAnswers = async () => {
    if (!confirm("Are you sure? This will delete all your answers and you'll need to complete the questionnaire again.")) return;
    setResetting(true);
    const deleteTxs = myResponses.map((r) => db.tx.questionnaire_responses[r.id].delete());
    const locationTxs = myUserLocation ? [db.tx.user_locations[myUserLocation.id].delete()] : [];
    const tx = [...deleteTxs, ...locationTxs];
    if (tx.length > 0) await db.transact(tx);
    setAnswers({});
    setCurrentIndex(0);
    setResetting(false);
  };

  if (saveSuccess) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Preferences saved</h1>
        <p className="mt-2 text-lg text-stone-600">
          Your preferences have been updated. Your recommendations will reflect these changes.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/for-you"
            className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-center font-medium text-white shadow-md hover:from-teal-600 hover:to-cyan-600"
          >
            See My Events
          </Link>
          <button
            type="button"
            onClick={() => {
              setSaveSuccess(false);
              setCurrentIndex(0);
            }}
            className="rounded-2xl border border-stone-200 bg-white px-6 py-3 font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Edit preferences again
          </button>
        </div>
      </div>
    );
  }

  if (QUESTIONNAIRE_QUESTIONS.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Find Your Events</h1>
        <p className="mt-1 text-stone-600">
          Complete the questionnaire to get personalised event recommendations.
        </p>
        <div className="mt-8 rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center text-stone-600 shadow-sm">
          <p className="font-medium">No questions yet</p>
          <p className="mt-1 text-sm">
            Add questions to <code className="rounded bg-stone-200 px-1">src/config/questions.config.ts</code> from your Word document.
          </p>
        </div>
      </div>
    );
  }

  const q = QUESTIONNAIRE_QUESTIONS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === QUESTIONNAIRE_QUESTIONS.length - 1;

  const accentColors = ["border-l-teal-500", "border-l-cyan-500", "border-l-violet-500", "border-l-orange-500", "border-l-emerald-500"];
  const accent = accentColors[currentIndex % accentColors.length];

  const goNext = () => {
    if (isLast) return;
    setCurrentIndex((i) => Math.min(i + 1, QUESTIONNAIRE_QUESTIONS.length - 1));
  };

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Find Your Events</h1>
          <p className="mt-1 text-stone-600">
            Answer a few questions to get personalised event recommendations. You can come back and
            update your preferences anytime.
          </p>
        </div>
        {myResponses.length > 0 && (
          <button
            type="button"
            onClick={handleResetAnswers}
            disabled={resetting}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm hover:bg-stone-50 disabled:opacity-50"
          >
            {resetting ? "Resetting..." : "Reset answers"}
          </button>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-medium text-stone-500">
          Question {currentIndex + 1} of {QUESTIONNAIRE_QUESTIONS.length}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / QUESTIONNAIRE_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        {postcodeError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            {postcodeError}
          </div>
        )}

        {/* Single question card */}
        <div key={q.id} className={`rounded-2xl border border-stone-200 border-l-4 bg-white p-6 shadow-sm ${accent}`}>
          <h3 className="font-semibold text-stone-900 text-lg">{q.text}</h3>
          <div className="mt-4 space-y-2">
            {q.type === "text" ? (
              <input
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                maxLength={8}
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
                placeholder="e.g. BS1 2AB"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-700 placeholder:text-stone-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            ) : q.type === "slider" ? (
              (() => {
                const min = q.sliderMin ?? 1;
                const max = q.sliderMax ?? 10;
                const step = q.sliderStep ?? 1;
                const rawStr = answers[q.id] as string | undefined;
                const parsed =
                  typeof rawStr === "string" && rawStr !== "" ? Number(rawStr) : Number.NaN;
                const safe =
                  Number.isInteger(parsed) && parsed >= min && parsed <= max
                    ? parsed
                    : Math.round((min + max) / 2);
                const labelMin = q.sliderLabelMin;
                const labelMax = q.sliderLabelMax;
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-stone-600">
                      {labelMin && labelMax
                        ? `Drag from ${min} (${labelMin}) to ${max} (${labelMax}).`
                        : `Drag from ${min} (matters least) to ${max} (matters most). Lower values sit closer to the centre on your personalisation diagram.`}
                    </p>
                    <div className="flex items-center justify-between gap-4 text-sm font-medium text-stone-500">
                      <span>{min}</span>
                      <span className="text-2xl tabular-nums text-teal-700">{safe}</span>
                      <span>{max}</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={safe}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      className="h-3 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-teal-600"
                      aria-valuemin={min}
                      aria-valuemax={max}
                      aria-valuenow={safe}
                      aria-label={`${q.text} Current value ${safe} out of ${max}`}
                    />
                  </div>
                );
              })()
            ) : q.options.map((opt) =>
              q.type === "single-select" ? (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    (answers[q.id] as string) === opt.id
                      ? "border-teal-300 bg-teal-50/50"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.id}
                    checked={(answers[q.id] as string) === opt.id}
                    onChange={() => handleSingleSelect(q.id, opt.id)}
                    className="h-4 w-4 text-teal-600"
                  />
                  <span className="text-stone-700">{opt.label}</span>
                </label>
              ) : (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    ((answers[q.id] as string[]) ?? []).includes(opt.id)
                      ? "border-violet-300 bg-violet-50/50"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={opt.id}
                    checked={((answers[q.id] as string[]) ?? []).includes(opt.id)}
                    onChange={(e) => handleMultiSelect(q.id, opt.id, e.target.checked)}
                    className="h-4 w-4 rounded text-violet-600"
                  />
                  <span className="text-stone-700">{opt.label}</span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Navigation buttons */}
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
              {submitted ? "Saving..." : "Save preferences"}
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

function QuestionnaireForm() {
  const user = db.useUser();
  const userId = user?.id;
  const { data: responsesData } = db.useQuery({ questionnaire_responses: {} });
  const { data: locationsData } = db.useQuery({ user_locations: {} });
  const existingResponses = (responsesData?.questionnaire_responses ?? []) as ResponseRow[];
  const myResponses = existingResponses.filter((r) => r.userId === userId);
  const allLocations = (locationsData?.user_locations ?? []) as UserLocationRow[];
  const myUserLocation = allLocations.find((l) => l.userId === userId) ?? null;

  if (!userId) {
    return <LoadingScreen />;
  }

  return (
    <QuestionnaireFormInner
      key={userId}
      userId={userId}
      myResponses={myResponses}
      myUserLocation={myUserLocation}
    />
  );
}

export default function QuestionnairePage() {
  return (
    <AuthGate>
      <QuestionnaireForm />
    </AuthGate>
  );
}
