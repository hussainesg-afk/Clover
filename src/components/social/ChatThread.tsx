"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import {
  type ConversationRow,
  type MessageRow,
  formatBubbleTime,
  formatDayDivider,
} from "@/lib/social/messages-utils";

function ReadTicks({ read }: { read: boolean }) {
  return (
    <span
      className={`ml-1 inline-flex shrink-0 -space-x-1.5 ${read ? "text-sky-200" : "text-white/65"}`}
      aria-label={read ? "Read" : "Sent"}
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <svg className="-ml-2 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

export default function ChatThread({
  conversationId,
  userId,
  otherName,
  onBack,
}: {
  conversationId: string;
  userId: string;
  otherName: string;
  onBack: () => void;
}) {
  const { data } = db.useQuery({
    conversations: {
      $: { where: { id: conversationId } },
      participant1: {},
      participant2: {},
      messages: {
        sender: {},
        $: { order: { createdAt: "asc" } },
      },
    },
  });

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastReadSent = useRef<number>(0);

  const conv = (data?.conversations ?? [])[0] as ConversationRow | undefined;
  const messages = (conv?.messages ?? []).sort(
    (a, b) => a.createdAt - b.createdAt
  ) as MessageRow[];

  const otherLastReadAt =
    conv?.participant1Id === userId
      ? conv?.participant2LastReadAt
      : conv?.participant1LastReadAt;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!conv || !userId) return;
    const lastMsgTime =
      messages.length > 0
        ? messages[messages.length - 1].createdAt
        : conv.createdAt;
    const readAt = Math.max(lastMsgTime, Date.now());
    const isP1 = conv.participant1Id === userId;
    const current = isP1
      ? conv.participant1LastReadAt
      : conv.participant2LastReadAt;
    if (current !== undefined && current >= readAt) return;
    if (readAt - lastReadSent.current < 300) return;
    lastReadSent.current = readAt;

    const patch = isP1
      ? { participant1LastReadAt: readAt }
      : { participant2LastReadAt: readAt };
    void db.transact([db.tx.conversations[conv.id].update(patch)]);
  }, [conv, messages, userId]);

  const handleSend = useCallback(async () => {
    const text = body.trim();
    if (!text || !userId || sending || !conv) return;
    setSending(true);
    try {
      const msgId = id();
      await db.transact([
        db.tx.messages[msgId]
          .update({
            conversationId,
            senderId: userId,
            body: text,
            createdAt: Date.now(),
          })
          .link({ conversation: conversationId, sender: userId }),
      ]);
      setBody("");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  }, [body, conversationId, userId, sending, conv]);

  if (!conv) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-stone-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <p className="mt-3 text-sm text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 lg:hidden"
          aria-label="Back"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-stone-900">{otherName}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-teal-50/40 to-stone-100 px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-stone-500">No messages yet. Say hello.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {messages.map((m, i) => {
              const isMe = m.senderId === userId;
              const prev = messages[i - 1];
              const showDayDivider =
                i === 0 ||
                new Date(m.createdAt).toDateString() !==
                  new Date(prev.createdAt).toDateString();
              const showName =
                !isMe &&
                (i === 0 ||
                  prev.senderId !== m.senderId ||
                  showDayDivider);
              const showTime =
                i === 0 ||
                m.createdAt - prev.createdAt > 5 * 60 * 1000 ||
                showDayDivider;

              const isRead =
                isMe &&
                otherLastReadAt !== undefined &&
                otherLastReadAt >= m.createdAt;

              return (
                <div key={m.id}>
                  {showDayDivider && (
                    <p className="py-3 text-center text-[11px] font-medium text-stone-500">
                      {formatDayDivider(m.createdAt)}
                    </p>
                  )}
                  {showTime && !showDayDivider && i > 0 && (
                    <p className="py-2 text-center text-[11px] text-stone-400">
                      {formatBubbleTime(m.createdAt)}
                    </p>
                  )}
                  <div
                    className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
                        {otherName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[min(75%,420px)] ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && showName && (
                        <p className="mb-0.5 pl-1 text-[12px] font-medium text-teal-700">
                          {otherName}
                        </p>
                      )}
                      <div
                        className={`inline-block rounded-2xl px-3 py-2 text-[14px] leading-relaxed shadow-sm ${
                          isMe
                            ? "rounded-br-md bg-teal-600 text-white"
                            : "rounded-bl-md border border-stone-200/80 bg-white text-stone-800"
                        }`}
                      >
                        <span className="whitespace-pre-wrap break-words">{m.body}</span>
                        <span
                          className={`mt-1 flex items-center justify-end gap-0.5 text-right text-[11px] ${
                            isMe ? "text-teal-100/90" : "text-stone-400"
                          }`}
                        >
                          {formatBubbleTime(m.createdAt)}
                          {isMe && <ReadTicks read={!!isRead} />}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-stone-200 bg-white px-3 py-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex items-end gap-2"
        >
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message..."
            className="min-w-0 flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-teal-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-40"
            aria-label="Send"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
