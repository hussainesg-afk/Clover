"use client";

import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { JOINABLE_GROUPS } from "@/config/groups.config";

type GroupMembership = {
  id: string;
  userId: string;
  groupName: string;
};

export default function GroupsPage() {
  const user = db.useUser();
  const userId = user?.id;

  const { data } = db.useQuery({ group_memberships: {} });

  const allMemberships = (data?.group_memberships ?? []) as GroupMembership[];
  const myMemberships = allMemberships.filter((m) => m.userId === userId);
  const myGroupNames = new Set(myMemberships.map((m) => m.groupName));

  const handleJoin = async (groupName: string) => {
    if (!userId) return;
    await db.transact([
      db.tx.group_memberships[id()].update({
        userId,
        groupName,
      }),
    ]);
  };

  const handleLeave = async (membershipId: string) => {
    await db.transact([db.tx.group_memberships[membershipId].delete()]);
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
      <h2 className="text-xl font-bold text-stone-800">Your Groups</h2>
      <p className="mt-2 text-stone-600">
        Groups you belong to and activities you do together.
      </p>

      {myMemberships.length > 0 ? (
        <div className="mt-6 space-y-4">
          {myMemberships.map((m) => {
            const group = JOINABLE_GROUPS.find((g) => g.id === m.groupName);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4"
              >
                <div>
                  <h3 className="font-semibold text-stone-800">
                    {group?.label ?? m.groupName}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {group?.description ?? "Forum group"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLeave(m.id)}
                  className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  Leave
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 text-sm text-stone-500">
          You have not joined any groups yet. Browse and join groups below.
        </p>
      )}

      <div className="mt-10">
        <h3 className="font-semibold text-stone-800">Browse groups</h3>
        <p className="mt-1 text-sm text-stone-500">
          Join forum groups based on event types and interests.
        </p>
        <div className="mt-4 space-y-4">
          {JOINABLE_GROUPS.map((group) => {
            const isMember = myGroupNames.has(group.id);
            const membership = myMemberships.find((m) => m.groupName === group.id);
            return (
              <div
                key={group.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4"
              >
                <div>
                  <h3 className="font-semibold text-stone-800">{group.label}</h3>
                  <p className="mt-1 text-sm text-stone-500">{group.description}</p>
                </div>
                {isMember && membership ? (
                  <button
                    type="button"
                    onClick={() => handleLeave(membership.id)}
                    className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleJoin(group.id)}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    Join
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
