export type FriendRequestRow = {
  id: string;
  fromId: string;
  toId: string;
  status: string;
  toEmail?: string;
  fromEmail?: string;
};

type UserRef = { id?: string; displayName?: string };

export type FriendRequestWithUsers = FriendRequestRow & {
  from?: UserRef;
  to?: UserRef;
};

export function isAcceptedFriend(
  userId: string | undefined,
  otherId: string | undefined,
  requests: FriendRequestRow[]
): boolean {
  if (!userId || !otherId || userId === otherId) return false;
  return requests.some(
    (r) =>
      r.status === "accepted" &&
      ((r.fromId === userId && r.toId === otherId) ||
        (r.fromId === otherId && r.toId === userId))
  );
}

export function buildFriendsList(
  requests: FriendRequestWithUsers[],
  userId: string | undefined,
  emailCache: Record<string, string>
): Array<{ id: string; display: string }> {
  if (!userId) return [];
  const acceptedFromMe = requests.filter(
    (r) => r.fromId === userId && r.status === "accepted"
  );
  const acceptedToMe = requests.filter(
    (r) => r.toId === userId && r.status === "accepted"
  );
  const seen = new Set<string>();
  const list: Array<{ id: string; display: string }> = [];
  for (const r of [...acceptedFromMe, ...acceptedToMe]) {
    const u = r.fromId === userId ? r.to : r.from;
    const fId = u?.id ?? (r.fromId === userId ? r.toId : r.fromId);
    if (!fId || seen.has(fId)) continue;
    seen.add(fId);
    const display =
      u?.displayName ??
      (r.fromId === userId ? r.toEmail : r.fromEmail) ??
      emailCache[fId] ??
      "Unknown";
    list.push({ id: fId, display });
  }
  return list;
}
