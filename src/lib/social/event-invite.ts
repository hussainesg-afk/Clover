import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { canonicalOrder } from "./messages-utils";

type MinimalConv = { id: string; participant1Id: string; participant2Id: string };

/**
 * Sends a direct message to a friend (creates a conversation if needed).
 * Caller must ensure the recipient is an accepted friend.
 */
export async function sendEventInviteMessage(
  userId: string,
  friendId: string,
  body: string,
  existingConversations: MinimalConv[]
): Promise<string> {
  const [p1, p2] = canonicalOrder(userId, friendId);
  const existing = existingConversations.find(
    (c) =>
      (c.participant1Id === p1 && c.participant2Id === p2) ||
      (c.participant1Id === p2 && c.participant2Id === p1)
  );
  const msgId = id();
  const now = Date.now();
  if (existing) {
    await db.transact([
      db.tx.messages[msgId]
        .update({
          conversationId: existing.id,
          senderId: userId,
          body,
          createdAt: now,
        })
        .link({ conversation: existing.id, sender: userId }),
    ]);
    return existing.id;
  }
  const convId = id();
  await db.transact([
    db.tx.conversations[convId]
      .update({ participant1Id: p1, participant2Id: p2, createdAt: now })
      .link({ participant1: p1, participant2: p2 }),
    db.tx.messages[msgId]
      .update({ conversationId: convId, senderId: userId, body, createdAt: now })
      .link({ conversation: convId, sender: userId }),
  ]);
  return convId;
}
