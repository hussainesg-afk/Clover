"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

type User = { id: string; displayName?: string };
type Conversation = {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: number;
  participant1?: User;
  participant2?: User;
  messages?: Array<{ id: string; body: string; senderId: string; createdAt: number; sender?: User }>;
};
type FriendRequest = { id: string; fromId: string; toId: string; status: string; to?: User; from?: User };

function canonicalOrder(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function getUserDisplay(u: User | undefined): string {
  return u?.displayName ?? "Unknown";
}

function ChatView({
  conversationId,
  userId,
  onBack,
}: {
  conversationId: string;
  userId: string;
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

  const conv = (data?.conversations ?? []).find((c) => c.id === conversationId) as Conversation | undefined;
  const other = conv?.participant1Id === userId ? conv.participant2 : conv?.participant1;
  const messages = (conv?.messages ?? []).sort((a, b) => a.createdAt - b.createdAt);

  const handleSend = useCallback(async () => {
    const text = body.trim();
    if (!text || !userId || sending) return;
    setSending(true);
    try {
      await db.transact([
        db.tx.messages[id()].update({
          conversationId,
          senderId: userId,
          body: text,
          createdAt: Date.now(),
        }),
      ]);
      setBody("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }, [body, conversationId, userId, sending]);

  if (!conv) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-stone-500">Loading conversation...</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-teal-600 hover:text-teal-700"
        >
          Back to messages
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[60vh] min-h-[320px] flex-col">
      <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden"
          aria-label="Back"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="h-10 w-10 shrink-0 rounded-full bg-stone-300" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-stone-800">{getUserDisplay(other)}</h3>
          <p className="text-sm text-stone-500">Direct message</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-3">
          {messages.map((m) => {
            const isMe = m.senderId === userId;
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-teal-600 text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}
                >
                  <p className="text-sm">{m.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 border-t border-stone-200 pt-3"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-stone-700 placeholder:text-stone-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="rounded-xl bg-teal-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function NewConversationView({
  userId,
  friends,
  onSelect,
  onCancel,
}: {
  userId: string;
  friends: User[];
  onSelect: (friendId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden"
          aria-label="Back"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-stone-800">New message</h3>
      </div>
      <p className="mt-4 text-sm text-stone-600">Choose a friend to message:</p>
      <div className="mt-4 space-y-2">
        {friends.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            Add friends first from the Friends tab.
          </p>
        ) : (
          friends.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              className="flex w-full items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 text-left transition hover:bg-stone-100"
            >
              <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
              <span className="font-medium text-stone-800">{getUserDisplay(f)}</span>
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

  const { data } = db.useQuery({
    conversations: {
      participant1: {},
      participant2: {},
      messages: {
        $: { order: { createdAt: "desc" }, limit: 1 },
      },
    },
    friend_requests: { from: {}, to: {} },
  });

  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [resolvingWith, setResolvingWith] = useState(false);
  const router = useRouter();

  const convs = (data?.conversations ?? []) as Conversation[];
  const requests = (data?.friend_requests ?? []) as (FriendRequest & { from?: User; to?: User })[];

  const acceptedFromMe = requests.filter(
    (r) => r.fromId === userId && r.status === "accepted"
  );
  const acceptedToMe = requests.filter(
    (r) => r.toId === userId && r.status === "accepted"
  );
  const friends = [
    ...acceptedFromMe.map((r) => r.to).filter(Boolean),
    ...acceptedToMe.map((r) => r.from).filter(Boolean),
  ] as User[];

  const myConversations = convs.filter(
    (c) => c.participant1Id === userId || c.participant2Id === userId
  );

  useEffect(() => {
    if (!userId || !withUserId || withUserId === userId || resolvingWith) return;
    setResolvingWith(true);
    const [p1, p2] = canonicalOrder(userId, withUserId);
    const existing = myConversations.find(
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
      db.tx.conversations[convId].update({
        participant1Id: p1,
        participant2Id: p2,
        createdAt: Date.now(),
      }),
    ])
      .then(() => router.replace(`/social/messages?c=${convId}`))
      .catch((err) => {
        console.error(err);
        setResolvingWith(false);
      });
  }, [userId, withUserId, myConversations, router, resolvingWith]);

  const sortedConvs = [...myConversations].sort(
    (a, b) => (b.messages?.[0]?.createdAt ?? b.createdAt) - (a.messages?.[0]?.createdAt ?? a.createdAt)
  );

  const handleStartNew = useCallback(async (friendId: string) => {
    if (!userId) return;
    setCreating(true);
    try {
      const [p1, p2] = canonicalOrder(userId, friendId);
      const existing = myConversations.find(
        (c) =>
          (c.participant1Id === p1 && c.participant2Id === p2) ||
          (c.participant1Id === p2 && c.participant2Id === p1)
      );
      if (existing) {
        window.location.href = `/social/messages?c=${existing.id}`;
        return;
      }
      const convId = id();
      await db.transact([
        db.tx.conversations[convId].update({
          participant1Id: p1,
          participant2Id: p2,
          createdAt: Date.now(),
        }),
      ]);
      window.location.href = `/social/messages?c=${convId}`;
    } catch (err) {
      console.error(err);
      setCreating(false);
    }
  }, [userId, myConversations]);

  const handleSelectFriend = (friendId: string) => {
    handleStartNew(friendId);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const showChat = conversationId && !showNew;
  const showNewFlow = showNew;
  const resolvingWithUser = withUserId && resolvingWith;

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800">Messages</h2>
      <p className="mt-2 text-stone-600">
        Direct messages with your friends and neighbours.
      </p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div
          className={`lg:w-80 ${showChat || showNewFlow ? "hidden lg:block" : ""}`}
        >
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="mb-4 w-full rounded-xl bg-teal-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-teal-700"
          >
            New message
          </button>
          <div className="space-y-2">
            {sortedConvs.length === 0 ? (
              <p className="text-sm text-stone-500">No conversations yet.</p>
            ) : (
              sortedConvs.map((c) => {
                const other = c.participant1Id === userId ? c.participant2 : c.participant1;
                const lastMsg = c.messages?.[0];
                const isActive = c.id === conversationId;
                return (
                  <Link
                    key={c.id}
                    href={`/social/messages?c=${c.id}`}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                      isActive
                        ? "border-teal-300 bg-teal-50/50"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-100"
                    }`}
                  >
                    <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-stone-800">
                        {getUserDisplay(other)}
                      </h3>
                      <p className="truncate text-sm text-stone-500">
                        {lastMsg ? lastMsg.body : "No messages yet"}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {resolvingWithUser ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              <p className="mt-4 text-stone-500">Starting conversation...</p>
            </div>
          ) : showChat ? (
            <ChatView
              conversationId={conversationId}
              userId={userId}
              onBack={() => (window.location.href = "/social/messages")}
            />
          ) : showNewFlow ? (
            <NewConversationView
              userId={userId}
              friends={friends}
              onSelect={handleSelectFriend}
              onCancel={() => setShowNew(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/30 py-16">
              <p className="text-stone-500">Select a conversation or start a new one.</p>
              <button
                type="button"
                onClick={() => setShowNew(true)}
                className="mt-4 text-teal-600 hover:text-teal-700"
              >
                New message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
