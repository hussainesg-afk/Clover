"use client";

export default function GroupsPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800">Your Groups</h2>
      <p className="mt-2 text-stone-600">
        Groups you belong to and activities you do together.
      </p>
      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <h3 className="font-semibold text-stone-800">Walking FC</h3>
          <p className="mt-1 text-sm text-stone-500">Weekly walks around the neighbourhood</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <h3 className="font-semibold text-stone-800">Jazz Club</h3>
          <p className="mt-1 text-sm text-stone-500">Monthly meet-ups for live jazz</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <h3 className="font-semibold text-stone-800">Henleaze Runners</h3>
          <p className="mt-1 text-sm text-stone-500">Morning runs and park sessions</p>
        </div>
        <p className="text-sm text-stone-400">More groups coming soon.</p>
      </div>
    </div>
  );
}
