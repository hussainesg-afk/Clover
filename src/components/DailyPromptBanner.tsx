"use client";

import { useState, useMemo } from "react";
import { id as newId } from "@instantdb/react";
import { db } from "@/lib/db";
import { getDailyPrompt } from "@/config/daily-prompts.config";

type PromptResponseRow = {
  id: string;
  userId: string;
  promptId: string;
  localDate: string;
  scaleValue?: number;
  selectedOptionIds?: string[];
  createdAt: number;
};

function getLocalDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dismissKey(userId: string) {
  return `clover_daily_prompt_dismissed_${userId}`;
}

export default function DailyPromptBanner({ userId }: { userId: string }) {
  const localDate = useMemo(getLocalDate, []);
  const prompt = useMemo(() => getDailyPrompt(localDate), [localDate]);

  const { data } = db.useQuery({ daily_prompt_responses: {} });

  const alreadyAnswered = useMemo(() => {
    const rows = (data?.daily_prompt_responses ?? []) as PromptResponseRow[];
    return rows.some(
      (r) =>
        r.userId === userId &&
        r.promptId === prompt.id &&
        r.localDate === localDate,
    );
  }, [data?.daily_prompt_responses, userId, prompt.id, localDate]);

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(dismissKey(userId)) === localDate;
  });

  const [scaleValue, setScaleValue] = useState(3);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (alreadyAnswered || dismissed || submitted) return null;

  const canSubmit =
    prompt.type === "scale" || (prompt.type === "single-select" && selectedOption !== null);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        userId,
        promptId: prompt.id,
        localDate,
        createdAt: Date.now(),
      };
      if (prompt.type === "scale") {
        payload.scaleValue = scaleValue;
      } else if (prompt.type === "single-select" && selectedOption) {
        payload.selectedOptionIds = [selectedOption];
      }
      await db.transact([db.tx.daily_prompt_responses[newId()].update(payload)]);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(dismissKey(userId), localDate);
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Daily check-in"
      className="mx-auto mb-4 max-w-5xl rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 px-5 py-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-teal-700">
          Daily check-in
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="mt-1.5 text-base font-medium text-stone-800">{prompt.text}</p>

      <div className="mt-3">
        {prompt.type === "scale" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {Array.from(
                { length: (prompt.scaleMax ?? 5) - (prompt.scaleMin ?? 1) + 1 },
                (_, i) => {
                  const val = (prompt.scaleMin ?? 1) + i;
                  const active = val === scaleValue;
                  return (
                    <button
                      key={val}
                      onClick={() => setScaleValue(val)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                        active
                          ? "bg-teal-600 text-white shadow-md"
                          : "bg-white text-stone-600 border border-stone-200 hover:border-teal-300 hover:bg-teal-50"
                      }`}
                    >
                      {val}
                    </button>
                  );
                },
              )}
            </div>
            {prompt.scaleLabels && (
              <div className="flex justify-between text-xs text-stone-500">
                <span>{prompt.scaleLabels.min}</span>
                <span>{prompt.scaleLabels.max}</span>
              </div>
            )}
          </div>
        )}

        {prompt.type === "single-select" && prompt.options && (
          <div className="flex flex-wrap gap-2">
            {prompt.options.map((opt) => {
              const active = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(active ? null : opt.id)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-teal-300 hover:bg-teal-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Submit"}
        </button>
        <button
          onClick={handleDismiss}
          className="text-sm font-medium text-stone-500 transition hover:text-stone-700"
        >
          Not today
        </button>
      </div>
    </div>
  );
}
