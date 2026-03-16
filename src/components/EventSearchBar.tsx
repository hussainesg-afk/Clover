"use client";

interface EventSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function EventSearchBar({
  value,
  onChange,
  placeholder = "Search events...",
  className = "",
}: EventSearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-stone-800 placeholder:text-stone-400 shadow-sm transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        aria-label="Search events"
      />
    </div>
  );
}
