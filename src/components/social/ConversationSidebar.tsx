"use client";

import Link from "next/link";
import type { ConversationRow, MessageRow } from "@/lib/social/messages-utils";
import { formatListTime } from "@/lib/social/messages-utils";

export default function ConversationSidebar({
  sorted,
  conversationId,
  resolveDisplay,
  onNewChat,
}: {
  sorted: ConversationRow[];
  conversationId: string | null;
  resolveDisplay: (c: ConversationRow) => string;
  onNewChat: () => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col border-b border-stone-200 bg-white lg:w-80 lg:flex-none lg:shrink-0 lg:border-b-0 lg:border-r lg:border-stone-200">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">Messages</h2>
        <button
          type="button"
          onClick={onNewChat}
          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          aria-label="New message"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-stone-500">No conversations yet.</p>
            <button
              type="button"
              onClick={onNewChat}
              className="mt-2 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Start a chat
            </button>
          </div>
        ) : (
          sorted.map((c) => {
            const display = resolveDisplay(c);
            const lastMsg = c.messages?.[0] as MessageRow | undefined;
            const isActive = c.id === conversationId;
            return (
              <Link
                key={c.id}
                href={`/social/messages?c=${c.id}`}
                className={`flex items-center gap-3 px-4 py-3 transition ${
                  isActive ? "bg-teal-50" : "hover:bg-stone-50"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                  {display.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 border-b border-stone-100 py-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-stone-900">{display}</p>
                    {lastMsg && (
                      <span className="shrink-0 text-[11px] text-stone-400">
                        {formatListTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {lastMsg ? lastMsg.body : "No messages yet"}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
