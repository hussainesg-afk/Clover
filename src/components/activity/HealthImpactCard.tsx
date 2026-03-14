"use client";

export interface HealthImpactMetric {
  value: string;
  label: string;
}

export interface HealthImpactCardProps {
  title: string;
  status: "Strong" | "Excellent" | "Good";
  accentColor: string;
  description: string;
  metrics: HealthImpactMetric[];
  goalLabel: string;
  goalCurrent: number;
  goalTotal: number;
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

export default function HealthImpactCard({
  title,
  status,
  accentColor,
  description,
  metrics,
  goalLabel,
  goalCurrent,
  goalTotal,
}: HealthImpactCardProps) {
  const progressPercent = goalTotal > 0 ? (goalCurrent / goalTotal) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div
        className="h-1"
        style={{ backgroundColor: accentColor }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-6 w-6 shrink-0" style={{ color: accentColor }} />
            <h3 className="text-lg font-bold text-stone-900">{title}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
            {status}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-stone-600">{description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl bg-stone-50 p-4"
            >
              <p
                className="text-xl font-bold"
                style={{ color: accentColor }}
              >
                {m.value}
              </p>
              <p className="mt-0.5 text-xs text-stone-600">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">{goalLabel}</span>
            <span className="font-medium text-stone-700">
              {goalCurrent} of {goalTotal} sessions
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
