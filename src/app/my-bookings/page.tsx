"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { normalizeEvent, type NormalizedEvent } from "@/lib/event-normalizer";
import {
  EVENT_BOOKING_SOURCE_EVENTS,
  EVENT_BOOKING_SOURCE_SOLO,
  type EventBookingRow,
} from "@/lib/event-bookings";
import { buildFriendsList, isAcceptedFriend, type FriendRequestWithUsers } from "@/lib/social/friends";
import { sendEventInviteMessage } from "@/lib/social/event-invite";
import type { ConversationRow } from "@/lib/social/messages-utils";
import AuthGate from "@/components/AuthGate";

function formatEventWhen(startDateTime?: string): string {
  if (!startDateTime) return "Date TBC";
  const d = parseEventDateTime(startDateTime);
  return d ? format(d, "EEEE d MMMM, h:mm a") : startDateTime;
}

function buildInviteBody(ev: NormalizedEvent): string {
  const when = formatEventWhen(ev.startDateTime);
  const place = [ev.venueName, ev.postCode].filter(Boolean).join(", ") || "location TBC";
  const lines = [
    `I am going to "${ev.title}" (${when}, ${place}).`,
    "Fancy joining me? You can find it in Clover under For You or add it from the event listings.",
  ];
  if (ev.bookingUrl) {
    lines.push(`Booking link: ${ev.bookingUrl}`);
  }
  return lines.join("\n");
}

type ResolvedBooking = {
  booking: EventBookingRow;
  event: NormalizedEvent | null;
};

function MyBookingsContent() {
  const user = db.useUser();
  const userId = user?.id;

  const { isLoading, data } = db.useQuery({
    event_bookings: {},
    events: {},
    solo_events: {},
    friend_requests: { from: {}, to: {} },
    conversations: {},
  });

  const [inviteOpenFor, setInviteOpenFor] = useState<string | null>(null);
  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const requests = useMemo(
    () => (data?.friend_requests ?? []) as FriendRequestWithUsers[],
    [data?.friend_requests]
  );

  const friendsList = useMemo(
    () => buildFriendsList(requests, userId, {}),
    [requests, userId]
  );

  const myConvs = useMemo(
    () =>
      ((data?.conversations ?? []) as ConversationRow[]).filter(
        (c) => c.participant1Id === userId || c.participant2Id === userId
      ),
    [data?.conversations, userId]
  );

  const eventsById = useMemo(() => {
    const m = new Map<string, NormalizedEvent>();
    for (const raw of data?.events ?? []) {
      m.set(`${EVENT_BOOKING_SOURCE_EVENTS}:${(raw as { id: string }).id}`, normalizeEvent(raw as Record<string, unknown>));
    }
    for (const raw of data?.solo_events ?? []) {
      m.set(`${EVENT_BOOKING_SOURCE_SOLO}:${(raw as { id: string }).id}`, normalizeEvent(raw as Record<string, unknown>));
    }
    return m;
  }, [data?.events, data?.solo_events]);

  const rows: ResolvedBooking[] = useMemo(() => {
    const bookings = (data?.event_bookings ?? []) as EventBookingRow[];
    const mine = userId ? bookings.filter((b) => b.userId === userId) : [];
    return mine.map((booking) => ({
      booking,
      event: eventsById.get(`${booking.source}:${booking.eventId}`) ?? null,
    }));
  }, [data?.event_bookings, userId, eventsById]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ta = a.event?.startDateTime
        ? parseEventDateTime(a.event.startDateTime)?.getTime() ?? 0
        : 0;
      const tb = b.event?.startDateTime
        ? parseEventDateTime(b.event.startDateTime)?.getTime() ?? 0
        : 0;
      if (ta !== tb) return ta - tb;
      return (b.booking.createdAt ?? 0) - (a.booking.createdAt ?? 0);
    });
  }, [rows]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const handleRemove = useCallback(
    async (bookingId: string) => {
      try {
        await db.transact([db.tx.event_bookings[bookingId].delete()]);
      } catch (e) {
        console.error(e);
        showToast("Could not remove booking.");
      }
    },
    [showToast]
  );

  const handleInvite = useCallback(
    async (friendId: string, friendDisplay: string, resolved: ResolvedBooking) => {
      if (!userId) return;
      if (!isAcceptedFriend(userId, friendId, requests)) {
        showToast("You can only invite friends.");
        return;
      }
      const ev =
        resolved.event ??
        ({
          id: resolved.booking.eventId,
          title: "an event",
          startDateTime: undefined,
          venueName: undefined,
          postCode: undefined,
          bookingUrl: undefined,
        } as NormalizedEvent);
      setInviteBusyId(friendId);
      try {
        await sendEventInviteMessage(userId, friendId, buildInviteBody(ev), myConvs);
        setInviteOpenFor(null);
        showToast(`Invite sent to ${friendDisplay}. Check Messages to chat.`);
      } catch (e) {
        console.error(e);
        showToast("Could not send invite.");
      } finally {
        setInviteBusyId(null);
      }
    },
    [userId, requests, myConvs, showToast]
  );

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">My bookings</h1>
        <p className="mt-1 text-sm text-stone-600">
          Events you have marked as going. Invite a friend from your friends list to join you.
        </p>
      </div>

      {toast && (
        <div
          className="mb-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900"
          role="status"
        >
          {toast}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      ) : sortedRows.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className="text-stone-600">You have not marked any events yet.</p>
          <p className="mt-2 text-sm text-stone-500">
            Open an event and tap <span className="font-medium">I am going</span> to save it here.
          </p>
          <Link
            href="/for-you/browse"
            className="mt-6 inline-flex rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Browse events
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {sortedRows.map(({ booking, event: ev }) => {
            const key = booking.id;
            const title = ev?.title ?? "Event (details unavailable)";
            const when = formatEventWhen(ev?.startDateTime);
            const place = [ev?.venueName, ev?.postCode].filter(Boolean).join(" · ");
            const inviteOpen = inviteOpenFor === key;

            return (
              <li
                key={key}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-stone-900">{title}</h2>
                    <p className="mt-1 text-sm text-stone-600">{when}</p>
                    {place ? <p className="mt-0.5 text-sm text-stone-500">{place}</p> : null}
                    {!ev ? (
                      <p className="mt-2 text-xs text-amber-700">
                        This listing may have been removed. You can still remove it from your bookings.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <button
                      type="button"
                      onClick={() => setInviteOpenFor((v) => (v === key ? null : key))}
                      className="rounded-xl border border-teal-500 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
                    >
                      {inviteOpen ? "Close" : "Invite a friend"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(booking.id)}
                      className="text-xs font-medium text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline"
                    >
                      Remove from my bookings
                    </button>
                  </div>
                </div>

                {inviteOpen && (
                  <div className="mt-4 border-t border-stone-100 pt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                      Your friends
                    </p>
                    {friendsList.length === 0 ? (
                      <p className="text-sm text-stone-500">
                        No friends yet.{" "}
                        <Link href="/social/friends" className="font-medium text-teal-600 hover:text-teal-700">
                          Add friends
                        </Link>{" "}
                        first.
                      </p>
                    ) : (
                      <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl bg-stone-50 p-2">
                        {friendsList.map((f) => (
                          <li key={f.id}>
                            <button
                              type="button"
                              disabled={inviteBusyId === f.id}
                              onClick={() =>
                                handleInvite(f.id, f.display, { booking, event: ev })
                              }
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-800 transition hover:bg-white disabled:opacity-50"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                                {f.display.charAt(0).toUpperCase()}
                              </span>
                              <span className="min-w-0 truncate">{f.display}</span>
                              {inviteBusyId === f.id ? (
                                <span className="ml-auto text-xs text-stone-400">Sending...</span>
                              ) : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 text-xs text-stone-500">
                      Sends a direct message with event details and booking link if available.
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <AuthGate>
      <MyBookingsContent />
    </AuthGate>
  );
}
