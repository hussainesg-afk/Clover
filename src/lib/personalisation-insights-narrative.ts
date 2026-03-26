import {
  EXPECTATION_PILLARS,
  EXPECTATION_SLIDER_MAX,
  EXPECTATION_SLIDER_NEUTRAL,
  expectationValuesFromResponses,
  type QuestionnaireResponseLike,
} from "@/config/expectations-framework.config";
import { QUESTIONNAIRE_QUESTIONS } from "@/config/questions.config";

/** Plain-language glosses for each pillar (social expectations framing, not clinical labels). */
const PILLAR_PLAIN: Record<string, string> = {
  proximity: "being around people and feeling part of a lively setting",
  support: "knowing others will look out for you when you need it",
  intimacy: "being deeply understood and emotionally close to others",
  fun: "laughter, play, and shared enjoyment",
  generativity: "contributing something meaningful and making a difference for others",
  respect: "being recognised and valued for what you bring",
};

export const PERSONALISATION_INSIGHTS_INTRO = {
  lead:
    "This page translates your questionnaire into a simple picture of what you are looking for from community and events. It is based on what you told us, not a medical or personality test.",
  bullets: [
    "The radar shows six expectations people often bring to social life (proximity through to respect). Higher scores mean that ingredient matters more when you decide whether an event feels worth your time.",
    "The list below is the same data as numbers. Together, these signals help Clover suggest activities that fit how you like to connect, unwind, and take part.",
    "You can change any answers in the questionnaire; save to refresh this page.",
  ],
};

export const PERSONALISATION_CHART_CAPTION =
  "Distance from the centre reflects how much each expectation matters to you on your 1 to 10 answers. A shape that reaches farther on some corners means those needs are stronger in your mix.";

export const PERSONALISATION_SCORES_INTRO =
  "Each score is your own rating of how much that dimension matters when you go out. There are no right or wrong profiles; different combinations suit different people.";

type RankedPillar = { id: string; v: number; answered: boolean };

function latestByQuestion(
  userId: string,
  rows: QuestionnaireResponseLike[],
): Map<string, QuestionnaireResponseLike> {
  const mine = rows.filter((r) => r.userId === userId);
  const m = new Map<string, QuestionnaireResponseLike>();
  for (const r of mine) {
    const prev = m.get(r.questionId);
    if (!prev || (r.createdAt ?? 0) > (prev.createdAt ?? 0)) {
      m.set(r.questionId, r);
    }
  }
  return m;
}

function optionLabel(questionId: string, optionId: string): string | null {
  const q = QUESTIONNAIRE_QUESTIONS.find((x) => x.id === questionId);
  if (!q) return null;
  const opt = q.options.find((o) => o.id === optionId);
  return opt?.label ?? null;
}

function selectedIds(raw: string | string[] | undefined): string[] {
  if (raw === undefined || raw === null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function topActivityLabels(userId: string, rows: QuestionnaireResponseLike[], max: number): string[] {
  const latest = latestByQuestion(userId, rows);
  const row = latest.get("activity-types");
  if (!row) return [];
  const ids = selectedIds(row.selectedOptionIds);
  const labels: string[] = [];
  for (const id of ids) {
    const lab = optionLabel("activity-types", id);
    if (lab) labels.push(lab.toLowerCase());
    if (labels.length >= max) break;
  }
  return labels;
}

function socialLevelPhrase(userId: string, rows: QuestionnaireResponseLike[]): string | null {
  const latest = latestByQuestion(userId, rows);
  const row = latest.get("social-level");
  if (!row) return null;
  const id = selectedIds(row.selectedOptionIds)[0];
  if (!id) return null;
  const map: Record<string, string> = {
    independent: "you prefer lower-key interaction or time that feels more independent",
    "small-group": "you like small, friendly groups",
    moderate: "you enjoy a moderately social level",
    "very-social": "you thrive when events are very social and interactive",
  };
  return map[id] ?? null;
}

function formatListTwo(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items[0]} and ${items[1]}`;
}

function rankExpectations(values: Record<string, number>): RankedPillar[] {
  return EXPECTATION_PILLARS.map((p) => ({
    id: p.id,
    v: values[p.id] ?? EXPECTATION_SLIDER_NEUTRAL,
    answered: values[p.id] !== undefined,
  }));
}

function sentenceFromExpectations(values: Record<string, number>): string {
  const ranked = rankExpectations(values);
  const answered = ranked.filter((r) => r.answered);
  if (answered.length === 0) {
    return "";
  }

  const sorted = [...answered].sort((a, b) => b.v - a.v);
  const maxV = sorted[0].v;
  const minV = sorted[sorted.length - 1].v;
  const spread = maxV - minV;
  const bottom = sorted[sorted.length - 1];
  const topTwo = sorted.slice(0, 2);
  const top2Set = new Set(topTwo.map((t) => t.id));

  if (answered.length === 1) {
    const id = answered[0].id;
    return `So far you have signalled that ${PILLAR_PLAIN[id] ?? id} matters especially for you; finishing the other expectation questions will round out this summary.`;
  }

  if (answered.length >= 4 && spread <= 2 && minV >= 5 && maxV <= 8) {
    return "Across the areas we asked about, your answers sit in a fairly even range, which suggests you are flexible and do not lean on just one type of need when you choose what to do out of the house.";
  }

  if (
    top2Set.has("fun") &&
    top2Set.has("proximity") &&
    topTwo[0].v >= 7 &&
    topTwo[1].v >= 7
  ) {
    return "Your combination points toward lively, sociable settings where simply being around people and sharing enjoyment matter most for a good outing.";
  }

  if (
    top2Set.has("intimacy") &&
    top2Set.has("support") &&
    topTwo[0].v >= 6 &&
    topTwo[1].v >= 6
  ) {
    return "You skew toward experiences where emotional closeness and mutual care feature strongly, not only quick or surface-level contact.";
  }

  if (
    top2Set.has("generativity") &&
    top2Set.has("respect") &&
    topTwo[0].v >= 6 &&
    topTwo[1].v >= 6
  ) {
    return "Contributing in a meaningful way and feeling that your efforts are noticed both rank high for you, which fits people who want purpose as well as connection from community life.";
  }

  if (answered.length >= 2 && maxV >= 8 && bottom.v <= 4 && spread >= 4) {
    return `What stands out is how much ${PILLAR_PLAIN[topTwo[0].id] ?? "your top priorities"} matters to you, while ${PILLAR_PLAIN[bottom.id] ?? "another area"} is less central in how you think about events right now.`;
  }

  if (maxV < 6) {
    return "Your scores lean modest across these expectations, which can mean you are still exploring what matters most or you prefer not to load too many needs onto a single outing.";
  }

  const a = PILLAR_PLAIN[topTwo[0].id] ?? topTwo[0].id;
  const b =
    topTwo[1] && topTwo[1].id !== topTwo[0].id && topTwo[1].v >= maxV - 1
      ? PILLAR_PLAIN[topTwo[1].id] ?? topTwo[1].id
      : null;

  if (b) {
    return `Taken together, your answers emphasise ${a} and ${b} more than other ingredients on this map.`;
  }

  return `Taken together, your answers emphasise ${a} more than other ingredients on this map.`;
}

function lifestyleSentence(
  userId: string,
  rows: QuestionnaireResponseLike[],
  asFollowOn: boolean,
): string | undefined {
  const activities = topActivityLabels(userId, rows, 2);
  const social = socialLevelPhrase(userId, rows);
  const actStr = formatListTwo(activities);

  if (actStr && social) {
    return asFollowOn
      ? `You also told us your activity interests include ${actStr}, and that ${social}.`
      : `Your interests include ${actStr}, and you indicated that ${social} when you choose events.`;
  }
  if (actStr) {
    return asFollowOn
      ? `You also told us your activity interests include ${actStr}.`
      : `Your interests include ${actStr}.`;
  }
  if (social) {
    return asFollowOn
      ? `You also told us that ${social} when you pick events.`
      : `You indicated that ${social} when you choose events.`;
  }
  return undefined;
}

export interface PersonalisationNarrative {
  primary: string;
  secondary?: string;
}

/**
 * One-sentence (plus optional follow-up) description of the user's stated personalisation mix.
 */
export function buildPersonalisationNarrative(
  userId: string | undefined,
  rows: QuestionnaireResponseLike[],
): PersonalisationNarrative | null {
  if (!userId) return null;

  const values = expectationValuesFromResponses(userId, rows);
  const expectationSentence = sentenceFromExpectations(values);
  const lifestyle = lifestyleSentence(userId, rows, !!expectationSentence);

  if (!expectationSentence && !lifestyle) {
    return null;
  }

  if (!expectationSentence && lifestyle) {
    const cap = lifestyle.charAt(0).toUpperCase() + lifestyle.slice(1);
    return { primary: cap };
  }

  return {
    primary: expectationSentence,
    ...(lifestyle ? { secondary: lifestyle.charAt(0).toUpperCase() + lifestyle.slice(1) } : {}),
  };
}
