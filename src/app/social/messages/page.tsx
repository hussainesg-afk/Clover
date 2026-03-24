"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

type User = { id: string; displayName?: string };
type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: number;
  sender?: User;
};
type Conversation = {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: number;
  participant1?: User;
  participant2?: User;
  messages?: Message[];
};
type FriendRequest = {
  id: string;
  fromId: string;
  toId: string;
  status: string;
  to?: User;
  from?: User;
  toEmail?: string;
  fromEmail?: string;
};

function canonicalOrder(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function resolveOtherDisplay(
  conv: Conversation,
  userId: string,
  requests: FriendRequest[],
  emailCache: Record<string, string>
): string {
  const otherId =
    conv.participant1Id === userId
      ? conv.participant2Id
      : conv.participant1Id;
  const other =
    conv.participant1Id === userId ? conv.participant2 : conv.participant1;
  if (other?.displayName) return other.displayName;
  if (emailCache[otherId]) return emailCache[otherId];
  const req = requests.find(
    (r) =>
      (r.fromId === userId && r.toId === otherId) ||
      (r.toId === userId && r.fromId === otherId)
  );
  if (req) {
    const email = req.fromId === userId ? req.toEmail : req.fromEmail;
    if (email) return email;
  }
  return "Unknown";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ChatView({
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

  const conv = (data?.conversations ?? [])[0] as Conversation | undefined;
  const messages = (conv?.messages ?? []).sort(
    (a, b) => a.createdAt - b.createdAt
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <p className="mt-3 text-sm text-stone-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 lg:hidden"
          aria-label="Back"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-stone-800">
            {otherName}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-stone-50 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200">
              <svg
                className="h-6 w-6 text-stone-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-stone-400">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {messages.map((m, i) => {
              const isMe = m.senderId === userId;
              const showTime =
                i === 0 ||
                m.createdAt - messages[i - 1].createdAt > 5 * 60 * 1000;
              return (
                <div key={m.id}>
                  {showTime && (
                    <p className="py-2 text-center text-[11px] text-stone-400">
                      {formatTime(m.createdAt)}
                    </p>
                  )}
                  <div
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${
                        isMe
                          ? "bg-teal-600 text-white"
                          : "bg-white text-stone-800 shadow-sm ring-1 ring-stone-200/60"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-stone-200 bg-white px-3 py-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message..."
            className="min-w-0 flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-400 focus:border-teal-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-300"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-40"
          >
            <svg
              className="h-4.5 w-4.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function NewConversationView({
  friends,
  onSelect,
  onCancel,
}: {
  friends: Array<{ id: string; display: string }>;
  onSelect: (friendId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 lg:hidden"
          aria-label="Back"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-stone-800">New message</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-stone-400">
              No friends yet.{" "}
              <Link
                href="/social/friends"
                className="font-medium text-teal-600 hover:text-teal-700"
              >
                Add someone
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
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-stone-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                {f.display.charAt(0).toUpperCase()}
              </div>
              <span className="min-w-0 truncate text-sm font-medium text-stone-700">
                {f.display}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const user = db.useUser();
  const userId = user?.id;
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");
  const withUserId = searchParams.get("with");
  const router = useRouter();

  const { data } = db.useQuery({
    conversations: {
      participant1: {},
      participant2: {},
      messages: { $: { order: { createdAt: "desc" }, limit: 1 } },
    },
    friend_requests: { from: {}, to: {} },
  });

  const [showNew, setShowNew] = useState(false);
  const [emailCache, setEmailCache] = useState<Record<string, string>>({});
  const resolvingRef = useRef(false);

  const requests = useMemo(
    () =>
      (data?.friend_requests ?? []) as (FriendRequest & {
        from?: User;
        to?: User;
      })[],
    [data?.friend_requests]
  );

  const myConvs = useMemo(
    () =>
      ((data?.conversations ?? []) as Conversation[]).filter(
        (c) => c.participant1Id === userId || c.participant2Id === userId
      ),
    [data?.conversations, userId]
  );
  const sorted = useMemo(
    () =>
      [...myConvs].sort(
        (a, b) =>
          (b.messages?.[0]?.createdAt ?? b.createdAt) -
          (a.messages?.[0]?.createdAt ?? a.createdAt)
      ),
    [myConvs]
  );

  const friendsList = useMemo(() => {
    const acceptedFromMe = requests.filter(
      (r) => r.fromId === userId && r.status === "accepted"
    );
    const acceptedToMe = requests.filter(
      (r) => r.toId === userId && r.status === "accepted"
    );
    const seenFriendIds = new Set<string>();
    const list: Array<{ id: string; display: string }> = [];
    for (const r of [...acceptedFromMe, ...acceptedToMe]) {
      const u = r.fromId === userId ? r.to : r.from;
      const fId = u?.id ?? (r.fromId === userId ? r.toId : r.fromId);
      if (!fId || seenFriendIds.has(fId)) continue;
      seenFriendIds.add(fId);
      const display =
        u?.displayName ??
        (r.fromId === userId ? r.toEmail : r.fromEmail) ??
        emailCache[fId] ??
        "Unknown";
      list.push({ id: fId, display });
    }
    return list;
  }, [requests, userId, emailCache]);

  const fetchedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!userId) return;
    let needsFetch = false;
    const toFetch: string[] = [];
    for (const c of myConvs) {
      const otherId =
        c.participant1Id === userId ? c.participant2Id : c.participant1Id;
      if (!otherId || fetchedRef.current.has(otherId) || emailCache[otherId])
        continue;
      const display = resolveOtherDisplay(c, userId, requests, emailCache);
      if (display !== "Unknown") continue;
      fetchedRef.current.add(otherId);
      toFetch.push(otherId);
      needsFetch = true;
    }
    if (!needsFetch) return;
    for (const otherId of toFetch) {
      fetch("/api/users/me?id=" + encodeURIComponent(otherId))
        .then((res) => (res.ok ? res.json() : null))
        .then((d: { email?: string } | null) => {
          if (d?.email) {
            setEmailCache((prev) => ({ ...prev, [otherId]: d.email! }));
          }
        })
        .catch(() => {});
    }
  }, [userId, myConvs, requests, emailCache]);

  useEffect(() => {
    if (
      !userId ||
      !withUserId ||
      withUserId === userId ||
      resolvingRef.current
    )
      return;
    resolvingRef.current = true;
    const [p1, p2] = canonicalOrder(userId, withUserId);
    const existing = myConvs.find(
      (c) =>
        (c.participant1Id === p1 && c.participant2Id === p2) ||
        (c.participant1Id === p2 && c.participant2Id === p1)
    );
    if (existing) {
      router.replace(`/social/messages?c=${existing.id}`);
      return;
    }
    const convId = id();
    db.transact([
      db.tx.conversations[convId]
        .update({
          participant1Id: p1,
          participant2Id: p2,
          createdAt: Date.now(),
        })
        .link({ participant1: p1, participant2: p2 }),
    ])
      .then(() => router.replace(`/social/messages?c=${convId}`))
      .catch((err) => {
        console.error(err);
        resolvingRef.current = false;
      });
  }, [userId, withUserId, myConvs, router]);

  const handleStartNew = useCallback(
    async (friendId: string) => {
      if (!userId) return;
      const [p1, p2] = canonicalOrder(userId, friendId);
      const existing = myConvs.find(
        (c) =>
          (c.participant1Id === p1 && c.participant2Id === p2) ||
          (c.participant1Id === p2 && c.participant2Id === p1)
      );
      if (existing) {
        router.push(`/social/messages?c=${existing.id}`);
        setShowNew(false);
        return;
      }
      const convId = id();
      await db.transact([
        db.tx.conversations[convId]
          .update({
            participant1Id: p1,
            participant2Id: p2,
            createdAt: Date.now(),
          })
          .link({ participant1: p1, participant2: p2 }),
      ]);
      router.push(`/social/messages?c=${convId}`);
      setShowNew(false);
    },
    [userId, myConvs, router]
  );

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const showChat = !!conversationId && !showNew;
  const showNewFlow = showNew;

  const activeConv = showChat
    ? sorted.find((c) => c.id === conversationId)
    : undefined;
  const activeDisplay = activeConv
    ? resolveOtherDisplay(activeConv, userId, requests, emailCache)
    : "Unknown";

  return (
    <div className="-m-6 flex h-[calc(100vh-220px)] min-h-[420px] flex-col overflow-hidden lg:flex-row">
      {/* Sidebar -- conversation list */}
      <div
        className={`flex shrink-0 flex-col border-b border-stone-200 bg-white lg:w-72 lg:border-b-0 lg:border-r ${
          showChat || showNewFlow ? "hidden lg:flex" : ""
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-stone-800">Messages</h2>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
            aria-label="New message"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-stone-400">No conversations yet.</p>
              <button
                type="button"
                onClick={() => setShowNew(true)}
                className="mt-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Start one
              </button>
            </div>
          ) : (
            sorted.map((c) => {
              const display = resolveOtherDisplay(
                c,
                userId,
                requests,
                emailCache
              );
              const lastMsg = c.messages?.[0];
              const isActive = c.id === conversationId;
              return (
                <Link
                  key={c.id}
                  href={`/social/messages?c=${c.id}`}
                  className={`flex items-center gap-3 px-4 py-3 transition ${
                    isActive
                      ? "bg-teal-50"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                    {display.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-stone-800">
                        {display}
                      </p>
                      {lastMsg && (
                        <span className="shrink-0 text-[11px] text-stone-400">
                          {formatTime(lastMsg.createdAt)}
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

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {withUserId && !conversationId ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            <p className="mt-3 text-sm text-stone-400">
              Opening conversation...
            </p>
          </div>
        ) : showChat ? (
          <ChatView
            conversationId={conversationId}
            userId={userId}
            otherName={activeDisplay}
            onBack={() => router.push("/social/messages")}
          />
        ) : showNewFlow ? (
          <NewConversationView
            friends={friendsList}
            onSelect={handleStartNew}
            onCancel={() => setShowNew(false)}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-stone-50 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-200">
              <svg
                className="h-7 w-7 text-stone-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-stone-600">
              Your messages
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Send a message to a friend to get started.
            </p>
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="mt-4 rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
            >
              Send message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
