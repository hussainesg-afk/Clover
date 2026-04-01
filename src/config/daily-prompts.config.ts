export type DailyPromptType = "scale" | "single-select" | "multi-select";

export interface DailyPromptOption {
  id: string;
  label: string;
}

export interface DailyPrompt {
  id: string;
  text: string;
  type: DailyPromptType;
  options?: DailyPromptOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

export const DAILY_PROMPTS: DailyPrompt[] = [
  {
    id: "social-life-satisfaction",
    text: "How satisfied are you with your social life right now?",
    type: "scale",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: { min: "Not at all", max: "Very satisfied" },
  },
  {
    id: "attendance-barrier",
    text: "What stopped you attending an event recently?",
    type: "single-select",
    options: [
      { id: "health", label: "Health or mobility" },
      { id: "transport", label: "Transport or travel" },
      { id: "cost", label: "Cost" },
      { id: "time", label: "Timing didn't suit" },
      { id: "motivation", label: "Didn't feel up to it" },
      { id: "awareness", label: "Didn't know about any" },
      { id: "none", label: "Nothing -- I've been going!" },
    ],
  },
  {
    id: "event-enjoyment",
    text: "How much did you enjoy the last event you went to?",
    type: "scale",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: { min: "Didn't enjoy", max: "Loved it" },
  },
  {
    id: "connection-feeling",
    text: "Did you feel a sense of connection with others this week?",
    type: "scale",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: { min: "Not at all", max: "Very connected" },
  },
  {
    id: "activity-interest",
    text: "What kind of activity would you most like to try next?",
    type: "single-select",
    options: [
      { id: "social-chat", label: "Coffee or social chat" },
      { id: "creative", label: "Something creative" },
      { id: "active", label: "Something active or outdoors" },
      { id: "learning", label: "A talk or class" },
      { id: "music", label: "Live music or performance" },
      { id: "quiet", label: "Something quiet and relaxed" },
    ],
  },
  {
    id: "wellbeing-today",
    text: "How are you feeling today overall?",
    type: "scale",
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: { min: "Quite low", max: "Really good" },
  },
  {
    id: "loneliness-check",
    text: "Have you felt lonely in the past few days?",
    type: "single-select",
    options: [
      { id: "not-at-all", label: "Not at all" },
      { id: "a-little", label: "A little" },
      { id: "quite-often", label: "Quite often" },
      { id: "most-of-time", label: "Most of the time" },
    ],
  },
];

/**
 * Deterministic prompt for a given calendar date.
 * Uses a simple day-of-year rotation so every day maps to exactly one prompt
 * and the cycle is predictable for analytics.
 */
export function getDailyPrompt(localDate: string): DailyPrompt {
  const d = new Date(localDate + "T00:00:00");
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}
