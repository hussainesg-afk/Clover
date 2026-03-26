"use client";

import { useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import ChatThread from "@/components/social/ChatThread";
import ConversationSidebar from "@/components/social/ConversationSidebar";
import NewConversationPanel from "@/components/social/NewConversationPanel";
import {
  buildFriendsList,
  isAcceptedFriend,
  type FriendRequestWithUsers,
} from "@/lib/social/friends";
import {
  canonicalOrder,
  resolveOtherDisplay,
  type ConversationRow,
} from "@/lib/social/messages-utils";

export default function MessagesPage() {
  const user = db.useUser();
  const userId = user?.id;
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");
  const withUserId = searchParams.get("with");
  const router = useRouter();

  const { isLoading, data } = db.useQuery({
    conversations: {
      participant1: {},
      participant2: {},
      messages: { $: { order: { createdAt: "desc" }, limit: 1 } },
    },
    friend_requests: { from: {}, to: {} },
  });

  const [showNew, setShowNew] = useState(false);
  const [emailCache, setEmailCache] = useState<Record<string, string>>({});
  const [gateBanner, setGateBanner] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const g = sessionStorage.getItem("clover_msg_gate");
    if (g === "not_friend") {
      sessionStorage.removeItem("clover_msg_gate");
      return "You can only message people on your friends list.";
    }
    return null;
  });
  const resolvingRef = useRef(false);

  const requests = useMemo(
    () => (data?.friend_requests ?? []) as FriendRequestWithUsers[],
    [data?.friend_requests]
  );

  const myConvs = useMemo(
    () =>
      ((data?.conversations ?? []) as ConversationRow[]).filter(
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

  const friendsList = useMemo(
    () => buildFriendsList(requests, userId, emailCache),
    [requests, userId, emailCache]
  );

  const fetchedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!userId) return;
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
    }
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
    if (isLoading || !userId || !conversationId) return;
    const conv = sorted.find((c) => c.id === conversationId);
    if (!conv) return;
    const otherId =
      conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
    if (!isAcceptedFriend(userId, otherId, requests)) {
      sessionStorage.setItem("clover_msg_gate", "not_friend");
      router.replace("/social/messages");
    }
  }, [isLoading, userId, conversationId, sorted, requests, router]);

  useEffect(() => {
    if (isLoading || !userId || !withUserId || withUserId === userId) {
      if (!withUserId) resolvingRef.current = false;
      return;
    }
    if (!isAcceptedFriend(userId, withUserId, requests)) {
      sessionStorage.setItem("clover_msg_gate", "not_friend");
      router.replace("/social/messages");
      resolvingRef.current = false;
      return;
    }
    if (resolvingRef.current) return;
    resolvingRef.current = true;
    const [p1, p2] = canonicalOrder(userId, withUserId);
    const existing = myConvs.find(
      (c) =>
        (c.participant1Id === p1 && c.participant2Id === p2) ||
        (c.participant1Id === p2 && c.participant2Id === p1)
    );
    if (existing) {
      router.replace(`/social/messages?c=${existing.id}`);
      resolvingRef.current = false;
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
      .then(() => {
        router.replace(`/social/messages?c=${convId}`);
        resolvingRef.current = false;
      })
      .catch((err) => {
        console.error(err);
        resolvingRef.current = false;
      });
  }, [isLoading, userId, withUserId, myConvs, requests, router]);

  const handleStartNew = useCallback(
    async (friendId: string) => {
      if (!userId) return;
      if (!isAcceptedFriend(userId, friendId, requests)) {
        setGateBanner("You can only message friends.");
        return;
      }
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
    [userId, myConvs, requests, router]
  );

  const resolveDisplay = useCallback(
    (c: ConversationRow) => resolveOtherDisplay(c, userId!, requests, emailCache),
    [userId, requests, emailCache]
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
  const hideSidebarOnMobile = showChat || showNewFlow;

  const activeConv = showChat
    ? sorted.find((c) => c.id === conversationId)
    : undefined;
  const activeDisplay = activeConv
    ? resolveOtherDisplay(activeConv, userId, requests, emailCache)
    : "Unknown";

  const openingWithFriend =
    !isLoading &&
    !!withUserId &&
    !conversationId &&
    isAcceptedFriend(userId, withUserId, requests);

  let mainContent: ReactNode;
  if (isLoading && withUserId && !conversationId) {
    mainContent = (
      <div className="flex flex-1 flex-col items-center justify-center bg-stone-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <p className="mt-3 text-sm text-stone-500">Loading...</p>
      </div>
    );
  } else if (openingWithFriend) {
    mainContent = (
      <div className="flex flex-1 flex-col items-center justify-center bg-stone-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <p className="mt-3 text-sm text-stone-500">Opening chat...</p>
      </div>
    );
  } else if (showChat && conversationId) {
    mainContent = (
      <ChatThread
        conversationId={conversationId}
        userId={userId}
        otherName={activeDisplay}
        onBack={() => router.push("/social/messages")}
      />
    );
  } else if (showNewFlow) {
    mainContent = (
      <NewConversationPanel
        friends={friendsList}
        onSelect={handleStartNew}
        onCancel={() => setShowNew(false)}
      />
    );
  } else {
    mainContent = (
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-teal-50/50 to-stone-50 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-stone-200">
          <svg
            className="h-8 w-8 text-teal-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="mt-5 text-lg font-semibold text-stone-900">Messages</p>
        <p className="mt-1 max-w-sm text-sm text-stone-600">
          Chat with friends. Pick a conversation or start a new one.
        </p>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="mt-6 rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
        >
          New chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[min(28rem,calc(100dvh-10rem))] w-full min-w-0 max-w-full flex-col overflow-hidden">
      {gateBanner && (
        <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>{gateBanner}</span>
          <button
            type="button"
            onClick={() => setGateBanner(null)}
            className="rounded-lg px-2 py-1 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          className={`min-h-0 flex min-w-0 max-w-full flex-col lg:shrink-0 ${
            hideSidebarOnMobile ? "hidden lg:flex" : "flex"
          }`}
        >
          <ConversationSidebar
            sorted={sorted}
            conversationId={conversationId}
            resolveDisplay={resolveDisplay}
            onNewChat={() => setShowNew(true)}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
          {mainContent}
        </div>
      </div>
    </div>
  );
}
