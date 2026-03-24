"use client";

import Link from "next/link";

interface EntertainmentGameShellProps {
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
}

export default function EntertainmentGameShell({
  title,
  subtitle,
  accent = "#0d9488",
  children,
}: EntertainmentGameShellProps) {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-stone-50 via-stone-100 to-stone-200"
      style={{ ["--game-accent" as string]: accent }}
    >
      <div className="mx-auto max-w-lg px-4 py-6 sm:max-w-2xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Entertainment
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
            )}
          </div>
          <Link
            href="/entertainment"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-stone-600 shadow-md ring-1 ring-stone-200/80 transition hover:bg-stone-50 hover:text-stone-900"
            aria-label="Back to Entertainment"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </header>
        <div
          className="rounded-2xl border border-stone-200/80 bg-white/90 p-4 shadow-xl shadow-stone-300/40 backdrop-blur-sm sm:p-6"
          style={{ borderTopColor: accent, borderTopWidth: "3px" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
