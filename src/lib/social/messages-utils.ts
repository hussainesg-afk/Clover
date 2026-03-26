import type { FriendRequestRow } from "./friends";

export type User = { id: string; displayName?: string };

export type MessageRow = {
  id: string;
  body: string;
  senderId: string;
  createdAt: number;
  sender?: User;
};

export type ConversationRow = {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: number;
  participant1LastReadAt?: number;
  participant2LastReadAt?: number;
  participant1?: User;
  participant2?: User;
  messages?: MessageRow[];
};

export function canonicalOrder(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function resolveOtherDisplay(
  conv: ConversationRow,
  userId: string,
  requests: FriendRequestRow[],
  emailCache: Record<string, string>
): string {
  const otherId =
    conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
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

export function formatListTime(ts: number): string {
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

export function formatBubbleTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDayDivider(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return "Today";
  }
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
