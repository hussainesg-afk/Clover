/** Six expectations framework: what people want from social and community life. */

export interface ExpectationPillar {
  id: string;
  label: string;
  hint: string;
}

export const EXPECTATION_PILLARS: ExpectationPillar[] = [
  { id: "proximity", label: "Proximity", hint: "Being surrounded by others" },
  { id: "support", label: "Support", hint: "Being cared for" },
  { id: "intimacy", label: "Intimacy", hint: "Feeling understood, emotionally or physically" },
  { id: "fun", label: "Fun", hint: "Sharing interests and enjoyment" },
  { id: "generativity", label: "Generativity", hint: "Contributing meaningfully and leaving a legacy" },
  { id: "respect", label: "Respect", hint: "Feeling seen and valued for your contributions" },
];

/** Slider range in the questionnaire (1 = near centre on diagram, 10 = outer edge). */
export const EXPECTATION_SLIDER_MIN = 1;
export const EXPECTATION_SLIDER_MAX = 10;

/** Maps slider value to radius factor 0 (centre) .. 1 (outer hexagon). */
export function expectationSliderToRadiusT(raw: number): number {
  const span = EXPECTATION_SLIDER_MAX - EXPECTATION_SLIDER_MIN;
  const clamped = Math.min(EXPECTATION_SLIDER_MAX, Math.max(EXPECTATION_SLIDER_MIN, raw));
  return (clamped - EXPECTATION_SLIDER_MIN) / span;
}

/** Neutral midpoint for pillars not yet answered (diagram sits halfway out). */
export const EXPECTATION_SLIDER_NEUTRAL =
  (EXPECTATION_SLIDER_MIN + EXPECTATION_SLIDER_MAX) / 2;

export function expectationQuestionId(pillarId: string): string {
  return `expectation-${pillarId}`;
}

/** Legacy multiple-choice ids (imp-0 … imp-100) mapped onto the 1–10 scale. */
function legacyImpToSlider(legacyPercent: number): number {
  const steps = [0, 25, 50, 75, 100];
  const sliders = [1, 3, 5, 8, 10];
  let best = 5;
  let bestDist = Infinity;
  for (let i = 0; i < steps.length; i++) {
    const d = Math.abs(steps[i] - legacyPercent);
    if (d < bestDist) {
      bestDist = d;
      best = sliders[i];
    }
  }
  return best;
}

/**
 * Parse stored answer: integer string "1".."10", or legacy "imp-*".
 */
export function parseStoredExpectationValue(raw: string | undefined): number | null {
  if (!raw) return null;
  if (raw.startsWith("imp-")) {
    const n = Number(raw.slice(4));
    if (!Number.isFinite(n) || n < 0 || n > 100) return null;
    return legacyImpToSlider(n);
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < EXPECTATION_SLIDER_MIN || n > EXPECTATION_SLIDER_MAX) return null;
  return n;
}

export interface QuestionnaireResponseLike {
  questionId: string;
  selectedOptionIds: string | string[];
  userId?: string;
  createdAt?: number;
}

/**
 * Latest answer per expectation question for this user. Values are slider integers 1–10.
 */
export function expectationValuesFromResponses(
  userId: string | undefined,
  responses: QuestionnaireResponseLike[]
): Record<string, number> {
  if (!userId) return {};
  const mine = responses.filter((r) => r.userId === userId);
  const byQuestion = new Map<string, QuestionnaireResponseLike>();
  for (const r of mine) {
    if (!r.questionId.startsWith("expectation-")) continue;
    const prev = byQuestion.get(r.questionId);
    if (!prev || (r.createdAt ?? 0) > (prev.createdAt ?? 0)) {
      byQuestion.set(r.questionId, r);
    }
  }
  const out: Record<string, number> = {};
  for (const pillar of EXPECTATION_PILLARS) {
    const qid = expectationQuestionId(pillar.id);
    const row = byQuestion.get(qid);
    if (!row) continue;
    const rawIds = row.selectedOptionIds;
    const first = Array.isArray(rawIds) ? rawIds[0] : rawIds;
    const n = parseStoredExpectationValue(typeof first === "string" ? first : undefined);
    if (n !== null) out[pillar.id] = n;
  }
  return out;
}

export function expectationCompletionCount(values: Record<string, number>): number {
  return EXPECTATION_PILLARS.filter((p) => values[p.id] !== undefined).length;
}
