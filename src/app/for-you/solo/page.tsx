"use client";

import Link from "next/link";
import AuthGate from "@/components/AuthGate";

const soloCards = [
  {
    title: "Solo - Top Picks",
    description: "Solo activities matched to your taste and habits from the questionnaire.",
    bgColor: "#E9693B",
    href: "/for-you/solo/top-picks",
  },
  {
    title: "Solo fitness",
    description: "Discover local running, walking and cycling routes near you.",
    bgColor: "#2CA3BF",
    href: "/for-you/solo/fitness",
  },
  {
    title: "Browse all solo events",
    description: "100 activities built for one. Explore at your own pace.",
    bgColor: "#378D63",
    href: "/for-you/solo/browse",
  },
];

function SoloContent() {
  return (
    <div className="min-h-screen bg-stone-100">
      <Link
        href="/for-you"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← Back to For You
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Solo</h1>
        <p className="mt-1 text-stone-600">Make the most of your own time with activities built for one.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {soloCards.slice(0, 2).map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex min-h-[140px] flex-col rounded-3xl p-5 text-white shadow-lg transition hover:shadow-xl"
            style={{ backgroundColor: card.bgColor }}
          >
            <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-white/95">{card.description}</p>
            <div className="mt-4 flex justify-end">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-lg font-medium transition group-hover:bg-white/35">
                →
              </span>
            </div>
          </Link>
        ))}
        <Link
          href={soloCards[2].href}
          className="group col-span-2 flex min-h-[240px] flex-col rounded-3xl p-6 text-white shadow-lg transition hover:shadow-xl md:min-h-[320px]"
          style={{ backgroundColor: soloCards[2].bgColor }}
        >
          <h3 className="text-2xl font-bold leading-tight md:text-3xl">{soloCards[2].title}</h3>
          <p className="mt-3 flex-1 text-base leading-relaxed text-white/95 md:text-lg">{soloCards[2].description}</p>
          <div className="mt-6 flex justify-end">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 text-xl font-medium transition group-hover:bg-white/35">
              →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function SoloPage() {
  return (
    <AuthGate>
      <SoloContent />
    </AuthGate>
  );
}
