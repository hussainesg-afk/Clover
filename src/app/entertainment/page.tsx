"use client";

import Link from "next/link";

const dailyChallenges = [
  {
    name: "Memory Match",
    color: "#EE6A2B",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <rect x="4" y="4" width="6" height="8" rx="1" />
        <rect x="14" y="4" width="6" height="8" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    name: "Word Link",
    color: "#8A4CB5",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    name: "Number Path",
    color: "#1D8075",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: "Everyday Trivia",
    color: "#2BA0B6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
];

const endlessPuzzles = [
  {
    name: "Word Search",
    color: "#E6295C",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <path d="M4 4h4v4H4z" />
        <path d="M10 4h4v4h-4z" />
        <path d="M16 4h4v4h-4z" />
        <path d="M4 10h4v4H4z" />
        <path d="M10 10h4v4h-4z" />
        <path d="M16 10h4v4h-4z" />
        <path d="M4 16h4v4H4z" />
        <path d="M10 16h4v4h-4z" />
        <path d="M16 16h4v4h-4z" />
      </svg>
    ),
  },
  {
    name: "Sudoku",
    color: "#6E2E9A",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <rect x="2" y="2" width="20" height="20" rx="1" />
        <path d="M2 8h20M2 16h20M8 2v20M16 2v20" strokeWidth={1.5} />
        <path d="M2 13.3h20M2 18.7h20M13.3 2v20M18.7 2v20" strokeWidth={0.5} opacity={0.6} />
      </svg>
    ),
  },
  {
    name: "Spot the Difference",
    color: "#A6CC00",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <rect x="2" y="6" width="8" height="12" rx="1" />
        <rect x="14" y="6" width="8" height="12" rx="1" />
        <circle cx="6" cy="10" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Jigsaw",
    color: "#33CCFF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <path d="M12 2v4a2 2 0 0 1-4 0V2H6a2 2 0 0 0-2 2v4a2 2 0 0 1 4 0h4a2 2 0 0 1 4 0h4V4a2 2 0 0 0-2-2h-2z" />
        <path d="M4 16v4a2 2 0 0 0 2 2h4v-4a2 2 0 0 0-4 0H4z" />
        <path d="M20 16v4a2 2 0 0 1-2 2h-4v-4a2 2 0 0 1 4 0h2z" />
      </svg>
    ),
  },
];

const playAgainst = [
  {
    name: "Chess",
    color: "#FF4500",
    href: "/entertainment/chess",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <path d="M12 2v2M10 5h4M8 8h8M7 11h10v7H7zM6 20h12" />
        <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Checkers",
    color: "#3333FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <rect x="2" y="2" width="20" height="20" rx="1" />
        <rect x="3" y="3" width="8" height="8" fill="currentColor" fillOpacity={0.3} stroke="none" />
        <rect x="13" y="3" width="8" height="8" fill="currentColor" fillOpacity={0.3} stroke="none" />
        <rect x="3" y="13" width="8" height="8" fill="currentColor" fillOpacity={0.3} stroke="none" />
        <rect x="13" y="13" width="8" height="8" fill="currentColor" fillOpacity={0.3} stroke="none" />
      </svg>
    ),
  },
  {
    name: "Word Battle",
    color: "#6A0DAD",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <rect x="3" y="6" width="6" height="12" rx="1" />
        <rect x="15" y="6" width="6" height="12" rx="1" />
        <path d="M9 10h6M9 14h6" />
      </svg>
    ),
  },
  {
    name: "Trivia Duel",
    color: "#FFD700",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
        <path d="M8 21h8" />
      </svg>
    ),
  },
];

function GameCard({
  name,
  color,
  icon,
  href,
}: {
  name: string;
  color: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const className =
    "group relative flex aspect-square flex-col items-start justify-between overflow-hidden rounded-2xl p-5 text-left shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2";
  const content = (
    <>
      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-white shadow-inner">
        {icon}
      </div>
      <div className="flex w-full items-end justify-between">
        <span className="text-lg font-bold leading-tight text-white drop-shadow-sm">
          {name}
        </span>
        <span className="rounded-full bg-white/25 p-2 text-white/90 transition group-hover:bg-white/35">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className={className}
        style={{ backgroundColor: color }}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      style={{ backgroundColor: color }}
    >
      {content}
    </button>
  );
}

function PlaceholderCard({ color }: { color: string }) {
  return (
    <div
      className="aspect-square rounded-2xl shadow-lg transition hover:shadow-xl"
      style={{ backgroundColor: color }}
    />
  );
}

/* Reading & Podcasts content cards */
const readingBooks = [
  { title: "Demon Copperhead", author: "Barbara Kingsolver", cover: "#44403c", trending: 1 },
  { title: "Tomorrow, and Tomorrow...", author: "Gabrielle Zevin", cover: "#a16207", trending: 2 },
  { title: "Spare", author: "Prince Harry", cover: "#991b1b", trending: 3 },
];

const LeafIcon = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 3.5 2.5 4.5A7 7 0 0 1 20 14" />
  </svg>
);
const SearchIcon = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const HeartIcon = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
);
const BuildingIcon = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M8 10h.01" />
  </svg>
);
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);
const PenIcon = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const BrainIcon = ({ className = "h-6 w-6 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
  </svg>
);
const WavesIcon = ({ className = "h-6 w-6 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2" />
  </svg>
);
const RunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6 shrink-0">
    <path d="M13 5l2 2-2 2" />
    <path d="M6 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M6 16v6" />
    <path d="M10 16h6l4 4-2 2h-4" />
  </svg>
);
const HeadphonesIcon = ({ className = "h-6 w-6 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);
const CoffeeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6 shrink-0">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <path d="M6 1v3M10 1v3M14 1v3" />
  </svg>
);
const RadioIcon = ({ className = "h-6 w-6 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </svg>
);
const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6 shrink-0">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 19v3" />
    <path d="M8 22h8" />
  </svg>
);
const FlaskIcon = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M10 2v7.31" />
    <path d="M14 9.3V2" />
    <path d="M8.5 2h7" />
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
    <path d="M5.5 20h13" />
  </svg>
);
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
);
const MessageIcon = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const SmileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01M15 9h.01" />
  </svg>
);
const NewspaperIcon = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
  </svg>
);

const readingGenres = [
  { label: "Nature & Outdoors", Icon: LeafIcon, bg: "bg-emerald-100" },
  { label: "Mystery & Thriller", Icon: SearchIcon, bg: "bg-amber-100" },
  { label: "Biography", Icon: BookIcon, bg: "bg-sky-100" },
  { label: "Romance", Icon: HeartIcon, bg: "bg-rose-100" },
  { label: "Self-Help", Icon: PersonIcon, bg: "bg-pink-100" },
  { label: "History", Icon: BuildingIcon, bg: "bg-stone-200" },
  { label: "Travel", Icon: GlobeIcon, bg: "bg-cyan-100" },
  { label: "Literary Fiction", Icon: PenIcon, bg: "bg-stone-200" },
];

const podcastAiSuggestions = [
  { title: "Feel Better, Live More", host: "Dr Rangan Chatterjee", reason: "Matches your wellness goals", Icon: BrainIcon, iconBg: "bg-pink-200" },
  { title: "Sideways", host: "Matthew Syed", reason: "You enjoy curious thinking", Icon: WavesIcon, iconBg: "bg-sky-200" },
  { title: "Marathon Talk", host: "Martin Yelling", reason: "Based on your running activity", Icon: RunIcon, iconBg: "bg-emerald-200" },
];

const podcastFriends = [
  { title: "Desert Island Discs", host: "BBC Radio 4", friends: "Sandra loves this", Icon: HeadphonesIcon, iconBg: "bg-stone-700" },
  { title: "The Rest is History", host: "Tom Holland & Dominic...", friends: "Dylan & Tim listen", Icon: LeafIcon, iconBg: "bg-emerald-800" },
  { title: "Fortunately", host: "Jane Garvey & Fi Glover", friends: "Jan & 6 others", Icon: CoffeeIcon, iconBg: "bg-amber-900" },
];

const podcastCriticallyAcclaimed = [
  { title: "Diary of a CEO", host: "Steven Bartlett", rank: 1, Icon: RadioIcon, iconBg: "bg-stone-600" },
  { title: "The High Low", host: "Pandora Sykes & Dolly...", rank: 2, Icon: MicIcon, iconBg: "bg-red-600" },
  { title: "In Our Time", host: "Melvyn Bragg", rank: 3, Icon: BuildingIcon, iconBg: "bg-amber-600" },
];

const podcastGenres = [
  { label: "Wellbeing", Icon: LeafIcon },
  { label: "History", Icon: BuildingIcon },
  { label: "Science", Icon: FlaskIcon },
  { label: "Culture & Arts", Icon: PaletteIcon },
  { label: "Interviews", Icon: MessageIcon },
  { label: "Comedy", Icon: SmileIcon },
  { label: "Travel & Nature", Icon: GlobeIcon },
  { label: "News & Politics", Icon: NewspaperIcon },
];

function ContentCard({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-[200px] flex-col rounded-2xl p-5 shadow-lg"
      style={{ backgroundColor: color }}
    >
      <h3 className="text-lg font-bold leading-tight text-white">
        {title}
      </h3>
      <div className="mt-4 flex-1">{children}</div>
    </div>
  );
}

export default function EntertainmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 sm:text-3xl">
          Entertainment
        </h1>
        <Link
          href="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-200/80 text-stone-600 transition hover:bg-stone-300 hover:text-stone-800"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      {/* Daily Challenges */}
      <section id="daily-challenges" className="mb-10">
        <h2 className="mb-4 text-base font-semibold uppercase tracking-wider text-stone-500">
          Daily Challenges
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {dailyChallenges.map((game) => (
            <GameCard
              key={game.name}
              name={game.name}
              color={game.color}
              icon={game.icon}
            />
          ))}
        </div>
      </section>

      {/* Endless puzzles */}
      <section id="endless-puzzles" className="mb-10">
        <h2 className="mb-4 text-base font-semibold uppercase tracking-wider text-stone-500">
          Endless puzzles
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {endlessPuzzles.map((game) => (
            <GameCard
              key={game.name}
              name={game.name}
              color={game.color}
              icon={game.icon}
            />
          ))}
        </div>
      </section>

      {/* Play against others? */}
      <section id="play-against" className="mb-10">
        <h2 className="mb-4 text-base font-semibold uppercase tracking-wider text-stone-500">
          Play against others?
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {playAgainst.map((game) => (
            <GameCard
              key={game.name}
              name={game.name}
              color={game.color}
              icon={game.icon}
              href={"href" in game ? game.href : undefined}
            />
          ))}
        </div>
      </section>

      {/* Reading & Podcasts */}
      <section id="reading" className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Reading</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContentCard title="Clover Ai Suggestions" color="#C85C2A">
            <div className="rounded-xl bg-white/10 p-4" />
          </ContentCard>
          <ContentCard title="Enjoyed by your friends" color="#9B6ECF">
            <div className="rounded-xl bg-white/10 p-4" />
          </ContentCard>
          <ContentCard title="Critically Acclaimed" color="#4BB3E0">
            <div className="flex gap-3">
              {readingBooks.map((book) => (
                <div
                  key={book.title}
                  className="flex min-w-0 flex-1 flex-col rounded-xl bg-white/95 p-3 shadow-sm"
                >
                  <div
                    className="mb-2 aspect-[3/4] w-full rounded-lg"
                    style={{ backgroundColor: book.cover }}
                  />
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {book.title}
                  </p>
                  <p className="truncate text-xs text-stone-500">{book.author}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <span>↑</span> Trending #{book.trending}
                  </p>
                </div>
              ))}
            </div>
          </ContentCard>
          <ContentCard title="Browse Genres" color="#2D7A5E">
            <div className="flex flex-wrap gap-2">
              {readingGenres.map((genre) => {
                const Icon = genre.Icon;
                return (
                <button
                  key={genre.label}
                  type="button"
                  className={`flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 ${genre.bg} transition hover:opacity-90`}
                >
                  <Icon />
                  {genre.label}
                </button>
                );
              })}
            </div>
          </ContentCard>
        </div>
      </section>

      {/* Podcasts */}
      <section className="pb-12">
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Podcasts</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContentCard title="Clover Ai Suggestions" color="#ED814B">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {podcastAiSuggestions.map((podcast) => {
                const Icon = podcast.Icon;
                return (
                <div
                  key={podcast.title}
                  className="flex min-w-[140px] flex-1 flex-col rounded-xl bg-white/95 p-3 shadow-sm"
                >
                  <div
                    className={`mb-2 flex h-14 w-14 items-center justify-center rounded-lg text-stone-700 ${podcast.iconBg}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{podcast.title}</p>
                  <p className="text-xs text-stone-500">{podcast.host}</p>
                  <p className="mt-1 text-xs text-stone-600">{podcast.reason}</p>
                </div>
                );
              })}
            </div>
          </ContentCard>
          <ContentCard title="Enjoyed by your friends" color="#9B6ECF">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {podcastFriends.map((podcast) => {
                const Icon = podcast.Icon;
                return (
                <div
                  key={podcast.title}
                  className="flex min-w-[140px] flex-1 flex-col rounded-xl bg-white/95 p-3 shadow-sm"
                >
                  <div
                    className={`mb-2 flex h-14 w-14 items-center justify-center rounded-lg text-white ${podcast.iconBg}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{podcast.title}</p>
                  <p className="text-xs text-stone-500">{podcast.host}</p>
                  <p className="mt-1 text-xs text-stone-600">• {podcast.friends}</p>
                </div>
                );
              })}
            </div>
          </ContentCard>
          <ContentCard title="Critically Acclaimed" color="#4BB3E0">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {podcastCriticallyAcclaimed.map((podcast) => {
                const Icon = podcast.Icon;
                return (
                <div
                  key={podcast.title}
                  className="flex min-w-[140px] flex-1 flex-col rounded-xl bg-white/95 p-3 shadow-sm"
                >
                  <div
                    className={`mb-2 flex h-14 w-14 items-center justify-center rounded-lg text-white ${podcast.iconBg}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{podcast.title}</p>
                  <p className="text-xs text-stone-500">{podcast.host}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">
                    ✓ #{podcast.rank} this week
                  </p>
                </div>
                );
              })}
            </div>
          </ContentCard>
          <ContentCard title="Browse Genres" color="#2D7A5E">
            <div className="flex flex-wrap gap-2">
              {podcastGenres.map((genre) => {
                const Icon = genre.Icon;
                return (
                <button
                  key={genre.label}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-sm font-medium text-stone-700 transition hover:opacity-90"
                >
                  <Icon />
                  {genre.label}
                </button>
                );
              })}
            </div>
          </ContentCard>
        </div>
      </section>
    </div>
  );
}
