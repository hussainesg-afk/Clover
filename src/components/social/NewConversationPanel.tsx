"use client";

import Link from "next/link";

export default function NewConversationPanel({
  friends,
  onSelect,
  onCancel,
}: {
  friends: Array<{ id: string; display: string }>;
  onSelect: (friendId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 lg:hidden"
          aria-label="Back"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-stone-900">New message</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-stone-500">
              No friends yet.{" "}
              <Link href="/social/friends" className="font-medium text-teal-600 hover:text-teal-700">
                Add friends
              </Link>{" "}
              first.
            </p>
          </div>
        ) : (
          friends.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-stone-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                {f.display.charAt(0).toUpperCase()}
              </div>
              <span className="min-w-0 truncate text-sm font-medium text-stone-800">{f.display}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
