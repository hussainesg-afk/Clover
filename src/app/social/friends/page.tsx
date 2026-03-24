"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

type FriendRequest = {
  id: string;
  fromId: string;
  toId: string;
  status: string;
  createdAt: number;
  toEmail?: string;
  fromEmail?: string;
};

type User = {
  id: string;
  displayName?: string;
  email?: string;
};

export default function FriendsPage() {
  const user = db.useUser();
  const userId = user?.id;

  const { data } = db.useQuery({
    friend_requests: { from: {}, to: {} },
  });

  const [emailInput, setEmailInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requests = (data?.friend_requests ?? []) as (FriendRequest & { from?: User; to?: User })[];

  const acceptedFromMe = requests.filter(
    (r) => r.fromId === userId && r.status === "accepted"
  );
  const acceptedToMe = requests.filter(
    (r) => r.toId === userId && r.status === "accepted"
  );
  const friendsRaw = [
    ...acceptedFromMe.map((r) => ({ req: r, user: r.to, id: r.to?.id ?? r.toId, iSent: true })),
    ...acceptedToMe.map((r) => ({ req: r, user: r.from, id: r.from?.id ?? r.fromId, iSent: false })),
  ].filter((x) => x.id);
  const seen = new Set<string>();
  const friends = friendsRaw.filter((x) => {
    if (seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
  });

  const pendingIncoming = requests.filter(
    (r) => r.toId === userId && r.status === "pending"
  );
  const pendingOutgoing = requests.filter(
    (r) => r.fromId === userId && r.status === "pending"
  );

  const backfillDone = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!userId) return;
    for (const r of [...pendingOutgoing, ...acceptedFromMe]) {
      if (r.toEmail || !r.toId || backfillDone.current.has(r.id)) continue;
      backfillDone.current.add(r.id);
      fetch("/api/users/me?id=" + encodeURIComponent(r.toId))
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { email?: string } | null) => {
          if (data?.email) {
            db.transact([db.tx.friend_requests[r.id].update({ toEmail: data.email })]);
          }
        })
        .catch(() => {});
    }
    for (const r of acceptedToMe) {
      if (r.fromEmail || !r.fromId || backfillDone.current.has(r.id)) continue;
      backfillDone.current.add(r.id);
      fetch("/api/users/me?id=" + encodeURIComponent(r.fromId))
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { email?: string } | null) => {
          if (data?.email) {
            db.transact([db.tx.friend_requests[r.id].update({ fromEmail: data.email })]);
          }
        })
        .catch(() => {});
    }
  }, [userId, pendingOutgoing, acceptedFromMe, acceptedToMe]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setError("Enter an email address");
      return;
    }
    setError(null);
    setSearching(true);
    try {
      const res = await fetch("/api/users/lookup?email=" + encodeURIComponent(email));
      const text = await res.text();
      let json: { error?: string; uid?: string; displayName?: string };
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        setError("Invalid response from server");
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "User not found");
        return;
      }
      const { uid } = json;
      if (uid === userId) {
        setError("You cannot add yourself");
        return;
      }
      let fromEmail: string | undefined;
      try {
        const meRes = await fetch("/api/users/me?id=" + encodeURIComponent(userId));
        if (meRes.ok) {
          const meJson = (await meRes.json()) as { email?: string };
          fromEmail = meJson.email;
        }
      } catch {
        // ignore
      }
      const existing = requests.find(
        (r) =>
          (r.fromId === userId && r.toId === uid) ||
          (r.fromId === uid && r.toId === userId)
      );
      if (existing) {
        if (existing.status === "accepted") {
          setError("Already friends");
          return;
        }
        if (existing.status === "pending" && existing.fromId === userId) {
          setError("Request already sent");
          return;
        }
        if (existing.status === "pending" && existing.toId === userId) {
          setError("They have already sent you a request - check pending");
          return;
        }
      }
      await db.transact([
        db.tx.friend_requests[id()].update({
          fromId: userId,
          toId: uid,
          status: "pending",
          createdAt: Date.now(),
          toEmail: email,
          fromEmail: fromEmail ?? undefined,
        }),
      ]);
      setEmailInput("");
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    await db.transact([
      db.tx.friend_requests[requestId].update({ status: "accepted" }),
    ]);
  };

  const handleReject = async (requestId: string) => {
    await db.transact([
      db.tx.friend_requests[requestId].update({ status: "rejected" }),
    ]);
  };

  const getFriendDisplay = (
    u: User | undefined,
    r: { toEmail?: string; fromEmail?: string },
    isTo: boolean
  ) => {
    if (u?.displayName) return u.displayName;
    const email = isTo ? r.toEmail : r.fromEmail;
    if (email) return email;
    return "Unknown";
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800">Friends</h2>
      <p className="mt-2 text-stone-600">
        Add friends by email and manage your connections.
      </p>

      <form onSubmit={handleAddFriend} className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter email to add"
            className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-stone-700 placeholder:text-stone-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            disabled={searching}
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-xl bg-teal-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {searching ? "Searching..." : "Add friend"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-amber-600">{error}</p>
        )}
      </form>

      {pendingIncoming.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-stone-800">Pending requests</h3>
          <p className="mt-1 text-sm text-stone-500">People who want to be your friend</p>
          <div className="mt-4 space-y-3">
            {pendingIncoming.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
                    <span className="font-medium text-stone-800">
                      {getFriendDisplay(r.from, r, false)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(r.id)}
                      className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(r.id)}
                      className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {pendingOutgoing.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-stone-800">Sent requests</h3>
          <p className="mt-1 text-sm text-stone-500">Waiting for a response</p>
          <div className="mt-4 space-y-3">
            {pendingOutgoing.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4"
                >
                  <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
                  <span className="font-medium text-stone-800">
                    {getFriendDisplay(r.to, r, true)}
                  </span>
                  <span className="text-sm text-stone-500">Pending</span>
                </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-semibold text-stone-800">Your friends</h3>
        <p className="mt-1 text-sm text-stone-500">
          {friends.length === 0
            ? "No friends yet. Add someone by email above."
            : `${friends.length} friend${friends.length === 1 ? "" : "s"}`}
        </p>
        <div className="mt-4 space-y-3">
          {friends.map(({ req, user, id }) => {
            const display =
              user?.displayName ??
              (req.fromId === userId ? req.toEmail : req.fromEmail) ??
              "Unknown";
            return (
              <div
                key={id}
                className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
                  <span className="font-medium text-stone-800">{display}</span>
                </div>
                <Link
                  href={`/social/messages?with=${id}`}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Message
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
