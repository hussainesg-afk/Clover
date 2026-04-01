"use client";

import { useMemo } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  EXPECTATION_PILLARS,
  EXPECTATION_SLIDER_MAX,
  EXPECTATION_SLIDER_NEUTRAL,
  expectationCompletionCount,
  expectationSliderToRadiusT,
  expectationValuesFromResponses,
} from "@/config/expectations-framework.config";
import {
  PERSONALISATION_CHART_CAPTION,
  PERSONALISATION_INSIGHTS_INTRO,
  PERSONALISATION_SCORES_INTRO,
  buildPersonalisationNarrative,
} from "@/lib/personalisation-insights-narrative";
import LoadingScreen from "@/components/LoadingScreen";

const VIEW_SIZE = 400;
const CX = VIEW_SIZE / 2;
const CY = VIEW_SIZE / 2;
const MAX_R = 118;
const LABEL_R = 152;
const AXES = EXPECTATION_PILLARS.length;

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function angleForIndex(i: number) {
  return -Math.PI / 2 + (i * 2 * Math.PI) / AXES;
}

function hexagonPoints(r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < AXES; i++) {
    const a = angleForIndex(i);
    const { x, y } = polarToCartesian(CX, CY, r, a);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function dataPolygonPoints(values: Record<string, number>): string {
  const pts: string[] = [];
  for (let i = 0; i < AXES; i++) {
    const pillar = EXPECTATION_PILLARS[i];
    const raw = values[pillar.id];
    const t = expectationSliderToRadiusT(raw ?? EXPECTATION_SLIDER_NEUTRAL);
    const a = angleForIndex(i);
    const { x, y } = polarToCartesian(CX, CY, MAX_R * t, a);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

type ResponseRow = {
  questionId: string;
  selectedOptionIds: string | string[];
  userId?: string;
  createdAt?: number;
};

export default function PersonalisationInsightsView() {
  const { user } = db.useAuth();
  const userId = user?.id;
  const { isLoading, data } = db.useQuery({ questionnaire_responses: {} });

  const values = useMemo(() => {
    const rows = (data?.questionnaire_responses ?? []) as ResponseRow[];
    return expectationValuesFromResponses(userId, rows);
  }, [data?.questionnaire_responses, userId]);

  const narrative = useMemo(() => {
    const rows = (data?.questionnaire_responses ?? []) as ResponseRow[];
    return buildPersonalisationNarrative(userId, rows);
  }, [data?.questionnaire_responses, userId]);

  const answered = expectationCompletionCount(values);
  const complete = answered === EXPECTATION_PILLARS.length;

  const polygonPoints = useMemo(() => dataPolygonPoints(values), [values]);

  const gridRings = [0.33, 0.66, 1];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Personalisation insights</h1>
        <p className="mt-2 max-w-2xl text-stone-600">{PERSONALISATION_INSIGHTS_INTRO.lead}</p>
        <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-stone-600">
          {PERSONALISATION_INSIGHTS_INTRO.bullets.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {narrative && (
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/90 to-cyan-50/80 p-5 shadow-sm sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Your mix in plain language
          </h2>
          <p className="mt-2 text-base leading-relaxed text-stone-800">{narrative.primary}</p>
          {narrative.secondary && (
            <p className="mt-3 text-sm leading-relaxed text-stone-700">{narrative.secondary}</p>
          )}
          <p className="mt-4 text-xs text-stone-500">
            This summary is generated from your saved questionnaire answers. It describes preferences,
            not a diagnosis or fixed type.
          </p>
        </div>
      )}

      {!complete && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {answered === 0 ? (
            <>
              No expectations answers yet.{" "}
              <Link href="/questionnaire" className="font-semibold underline hover:text-amber-950">
                Complete the questionnaire
              </Link>{" "}
              (including the six expectations questions at the end).
            </>
          ) : (
            <>
              You have answered {answered} of {EXPECTATION_PILLARS.length} expectations questions. Missing
              answers use a neutral midpoint on the chart.{" "}
              <Link href="/questionnaire" className="font-semibold underline hover:text-amber-950">
                Continue the questionnaire
              </Link>
              .
            </>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-stone-500">
          Your expectations profile
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-stone-600">
          {PERSONALISATION_CHART_CAPTION}
        </p>
        <div className="mx-auto mt-4 max-w-[min(100%,420px)]">
          <svg
            viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
            className="h-auto w-full"
            role="img"
            aria-label="Radar chart of how important each expectation is to you, from centre low to outer high"
          >
            <defs>
              <linearGradient id="expectationsFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(20 184 166)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="rgb(6 182 212)" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {gridRings.map((t) => (
              <polygon
                key={t}
                points={hexagonPoints(MAX_R * t)}
                fill="none"
                stroke="rgb(231 229 228)"
                strokeWidth={1}
              />
            ))}

            {EXPECTATION_PILLARS.map((_, i) => {
              const a = angleForIndex(i);
              const { x, y } = polarToCartesian(CX, CY, MAX_R, a);
              return (
                <line
                  key={i}
                  x1={CX}
                  y1={CY}
                  x2={x}
                  y2={y}
                  stroke="rgb(231 229 228)"
                  strokeWidth={1}
                />
              );
            })}

            <polygon
              points={polygonPoints}
              fill="url(#expectationsFill)"
              stroke="rgb(13 148 136)"
              strokeWidth={2}
              strokeLinejoin="round"
              opacity={answered === 0 ? 0.35 : 1}
            />

            {EXPECTATION_PILLARS.map((p, i) => {
              const a = angleForIndex(i);
              const { x, y } = polarToCartesian(CX, CY, LABEL_R, a);
              const cosA = Math.cos(a);
              const sinA = Math.sin(a);
              const textAnchor =
                cosA > 0.2 ? "start" : cosA < -0.2 ? "end" : ("middle" as const);
              const dy =
                sinA < -0.45 ? "0.35em" : sinA > 0.45 ? "-0.15em" : "0.28em";
              return (
                <text
                  key={p.id}
                  x={x}
                  y={y}
                  dy={dy}
                  textAnchor={textAnchor}
                  fill="#44403c"
                  fontSize={12}
                  fontWeight={600}
                  className="select-none"
                >
                  {p.label}
                </text>
              );
            })}
          </svg>
        </div>

        <p className="sr-only">
          Values by pillar:{" "}
          {EXPECTATION_PILLARS.map((p) => {
            const v = values[p.id] ?? EXPECTATION_SLIDER_NEUTRAL;
            return `${p.label} ${v} out of ${EXPECTATION_SLIDER_MAX}`;
          }).join(", ")}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-900">Your scores (1 = least, 10 = most)</h2>
        <p className="max-w-2xl text-sm text-stone-600">{PERSONALISATION_SCORES_INTRO}</p>
        <ul className="space-y-3">
          {EXPECTATION_PILLARS.map((p) => {
            const v = values[p.id];
            const has = v !== undefined;
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <span className="font-semibold text-stone-800">{p.label}</span>
                  <p className="text-sm text-stone-500">{p.hint}</p>
                </div>
                <div className="text-right">
                  {has ? (
                    <p className="text-lg font-semibold tabular-nums text-teal-800">
                      {v}
                      <span className="text-sm font-normal text-stone-500">
                        {" "}
                        / {EXPECTATION_SLIDER_MAX}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-stone-400">Not answered yet</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-center text-sm text-stone-500">
        <Link href="/questionnaire" className="font-medium text-teal-600 underline hover:text-teal-700">
          Open questionnaire
        </Link>{" "}
        to change expectations, event preferences, postcode, or accessibility.
      </p>
    </div>
  );
}
