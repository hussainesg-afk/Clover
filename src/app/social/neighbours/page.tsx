"use client";

import Link from "next/link";
import { db } from "@/lib/db";
import {
  haversineDistanceMiles,
  NEIGHBOURS_RADIUS_MILES,
} from "@/lib/geo";

type UserLocation = {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  user?: { id: string; displayName?: string };
};

type GroupMembership = {
  id: string;
  userId: string;
  groupName: string;
};

export default function NeighboursPage() {
  const user = db.useUser();
  const userId = user?.id;

  const { data: locationsData } = db.useQuery({
    user_locations: { user: {} },
  });
  const { data: responsesData } = db.useQuery({
    questionnaire_responses: {},
  });
  const { data: membershipsData } = db.useQuery({ group_memberships: {} });

  const allLocations = (locationsData?.user_locations ?? []) as UserLocation[];
  const allMemberships = (membershipsData?.group_memberships ?? []) as GroupMembership[];
  const responses = (responsesData?.questionnaire_responses ?? []) as {
    questionId: string;
    userId?: string;
    lat?: number;
    lng?: number;
  }[];

  const myLocation = allLocations.find((l) => l.userId === userId);
  const myPostcodeResponse = responses.find(
    (r) => r.userId === userId && r.questionId === "postcode"
  );
  const myLat = myLocation?.lat ?? myPostcodeResponse?.lat;
  const myLng = myLocation?.lng ?? myPostcodeResponse?.lng;

  const otherLocations = allLocations.filter((l) => l.userId !== userId);

  const neighbours =
    typeof myLat === "number" && typeof myLng === "number"
      ? otherLocations
          .filter((loc) => {
            if (typeof loc.lat !== "number" || typeof loc.lng !== "number")
              return false;
            const dist = haversineDistanceMiles(
              myLat,
              myLng,
              loc.lat,
              loc.lng
            );
            return dist <= NEIGHBOURS_RADIUS_MILES;
          })
          .sort((a, b) => {
            const distA = haversineDistanceMiles(myLat, myLng, a.lat, a.lng);
            const distB = haversineDistanceMiles(myLat, myLng, b.lat, b.lng);
            return distA - distB;
          })
      : [];

  const getGroupsForUser = (uid: string) =>
    allMemberships
      .filter((m) => m.userId === uid)
      .map((m) => m.groupName)
      .join(", ");

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (typeof myLat !== "number" || typeof myLng !== "number") {
    return (
      <div>
        <h2 className="text-xl font-bold text-stone-800">Neighbours</h2>
        <p className="mt-2 text-stone-600">
          People within 200 metres of your postcode.
        </p>
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">Add your postcode to see neighbours</p>
          <p className="mt-1 text-sm">
            Complete the questionnaire with your postcode to find people nearby.
          </p>
          <Link
            href="/questionnaire"
            className="mt-4 inline-block rounded-xl bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700"
          >
            Go to questionnaire
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800">Neighbours</h2>
      <p className="mt-2 text-stone-600">
        People within 200 metres of your postcode.
      </p>

      {neighbours.length === 0 ? (
        <p className="mt-8 text-stone-500">
          No neighbours found within 200m. Add your postcode in the questionnaire
          if you have not yet, or check back later as more people join.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {neighbours.map((loc) => {
            const displayName =
              loc.user?.displayName || "Unknown";
            const groups = getGroupsForUser(loc.userId);
            return (
              <div
                key={loc.id}
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4"
              >
                <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
                <div>
                  <h3 className="font-semibold text-stone-800">
                    {displayName}
                  </h3>
                  {groups && (
                    <p className="text-sm text-stone-500">{groups}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
