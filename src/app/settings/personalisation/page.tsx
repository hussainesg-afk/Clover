"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { PERSONALISATION_QUESTIONS } from "@/config/questions.config";
import AuthGate from "@/components/AuthGate";

const PERSONALISATION_IDS = new Set(PERSONALISATION_QUESTIONS.map((q) => q.id));

type ResponseRow = {
  id: string;
  questionId: string;
  selectedOptionIds: string | string[];
  userId?: string;
  createdAt?: number;
};

function buildAnswersFromResponses(
  responses: ResponseRow[],
): Record<string, string | string[]> {
  const byQuestion = new Map<string, ResponseRow>();
  for (const r of responses) {
    if (!PERSONALISATION_IDS.has(r.questionId)) continue;
    const existing = byQuestion.get(r.questionId);
    if (!existing || (r.createdAt ?? 0) > (existing.createdAt ?? 0)) {
      byQuestion.set(r.questionId, r);
    }
  }
  const answers: Record<string, string | string[]> = {};
  for (const [, r] of byQuestion) {
    const val = r.selectedOptionIds;
    if (Array.isArray(val) && val.length === 1 && typeof val[0] === "string") {
      answers[r.questionId] = val[0];
    } else {
      answers[r.questionId] = val;
    }
  }
  return answers;
}

function PersonalisationFormInner({
  userId,
  myResponses,
}: {
  userId: string;
  myResponses: ResponseRow[];
}) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    () => buildAnswersFromResponses(myResponses),
  );
  const [submitted, setSubmitted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const qCurrent = PERSONALISATION_QUESTIONS[currentIndex];
  useEffect(() => {
    if (qCurrent?.type !== "slider") return;
    setAnswers((prev) => {
      const cur = prev[qCurrent.id];
      if (cur !== undefined && cur !== "") return prev;
      const mid = Math.round(
        ((qCurrent.sliderMin ?? 1) + (qCurrent.sliderMax ?? 10)) / 2,
      );
      return { ...prev, [qCurrent.id]: String(mid) };
    });
  }, [
    currentIndex,
    qCurrent?.id,
    qCurrent?.type,
    qCurrent?.sliderMin,
    qCurrent?.sliderMax,
  ]);

  const handleSingleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleMultiSelect = (
    questionId: string,
    optionId: string,
    checked: boolean,
  ) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) ?? [];
      const next = checked
        ? [...current, optionId]
        : current.filter((x) => x !== optionId);
      return { ...prev, [questionId]: next };
    });
  };

  const handleSliderChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    const personalisationResponses = myResponses.filter((r) =>
      PERSONALISATION_IDS.has(r.questionId),
    );
    const deleteTxs = personalisationResponses.map((r) =>
      db.tx.questionnaire_responses[r.id].delete(),
    );

    const insertTxs = Object.entries(answers)
      .filter(([qId]) => PERSONALISATION_IDS.has(qId))
      .map(([questionId, selectedOptionIds]) =>
        db.tx.questionnaire_responses[id()].update({
          questionId,
          selectedOptionIds: Array.isArray(selectedOptionIds)
            ? selectedOptionIds
            : [selectedOptionIds],
          userId,
          createdAt: Date.now(),
        }),
      );

    const tx = [...deleteTxs, ...insertTxs];
    if (tx.length > 0) {
      await db.transact(tx);
    }

    setSubmitted(false);
    setSaveSuccess(true);
  };

  if (saveSuccess) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Personalisation saved
        </h1>
        <p className="mt-2 text-lg text-stone-600">
          Thank you. Your answers help us tailor your experience.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/settings"
            className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-center font-medium text-white shadow-md hover:from-teal-600 hover:to-cyan-600"
          >
            Back to Settings
          </Link>
          <button
            type="button"
            onClick={() => {
              setSaveSuccess(false);
              setCurrentIndex(0);
            }}
            className="rounded-2xl border border-stone-200 bg-white px-6 py-3 font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Edit answers
          </button>
        </div>
      </div>
    );
  }

  const q = PERSONALISATION_QUESTIONS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === PERSONALISATION_QUESTIONS.length - 1;

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
    setCurrentIndex((i) =>
      Math.min(i + 1, PERSONALISATION_QUESTIONS.length - 1),
    );
  };

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Settings
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-stone-900">
          Advanced User Personalisation
        </h1>
        <p className="mt-1 text-stone-600">
          Help us understand you better so we can personalise your experience.
          All answers are optional and kept private.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-medium text-stone-500">
          Question {currentIndex + 1} of {PERSONALISATION_QUESTIONS.length}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / PERSONALISATION_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="mt-8">
        <div
          key={q.id}
          className={`rounded-2xl border border-stone-200 border-l-4 bg-white p-6 shadow-sm ${accent}`}
        >
          <h3 className="text-lg font-semibold text-stone-900">{q.text}</h3>
          <div className="mt-4 space-y-2">
            {q.type === "slider"
              ? (() => {
                  const min = q.sliderMin ?? 1;
                  const max = q.sliderMax ?? 10;
                  const step = q.sliderStep ?? 1;
                  const rawStr = answers[q.id] as string | undefined;
                  const parsed =
                    typeof rawStr === "string" && rawStr !== ""
                      ? Number(rawStr)
                      : Number.NaN;
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
                          : `Drag from ${min} to ${max}.`}
                      </p>
                      <div className="flex items-center justify-between gap-4 text-sm font-medium text-stone-500">
                        <span>{min}</span>
                        <span className="text-2xl tabular-nums text-teal-700">
                          {safe}
                        </span>
                        <span>{max}</span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={safe}
                        onChange={(e) =>
                          handleSliderChange(q.id, e.target.value)
                        }
                        className="h-3 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-teal-600"
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={safe}
                        aria-label={`${q.text} Current value ${safe} out of ${max}`}
                      />
                    </div>
                  );
                })()
              : q.options.map((opt) =>
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
                        checked={((answers[q.id] as string[]) ?? []).includes(
                          opt.id,
                        )}
                        onChange={(e) =>
                          handleMultiSelect(q.id, opt.id, e.target.checked)
                        }
                        className="h-4 w-4 rounded text-violet-600"
                      />
                      <span className="text-stone-700">{opt.label}</span>
                    </label>
                  ),
                )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-3 font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          {isLast ? (
            <button
              type="button"
              disabled={submitted}
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-medium text-white shadow-md transition hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
            >
              {submitted ? "Saving..." : "Save"}
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-medium text-white shadow-md transition hover:from-teal-600 hover:to-cyan-600"
            >
              Next
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function PersonalisationForm() {
  const user = db.useUser();
  const userId = user?.id;
  const { data: responsesData } = db.useQuery({
    questionnaire_responses: {},
  });
  const existingResponses = (responsesData?.questionnaire_responses ??
    []) as ResponseRow[];
  const myResponses = existingResponses.filter((r) => r.userId === userId);

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <PersonalisationFormInner
      key={userId}
      userId={userId}
      myResponses={myResponses}
    />
  );
}

export default function PersonalisationPage() {
  return (
    <AuthGate>
      <PersonalisationForm />
    </AuthGate>
  );
}
