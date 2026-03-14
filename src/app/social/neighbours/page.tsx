"use client";

export default function NeighboursPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800">Neighbours</h2>
      <p className="mt-2 text-stone-600">
        People nearby who share your interests and activities.
      </p>
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
          <div>
            <h3 className="font-semibold text-stone-800">Tina M.</h3>
            <p className="text-sm text-stone-500">Walking FC, Jazz Club</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
          <div>
            <h3 className="font-semibold text-stone-800">Dave J.</h3>
            <p className="text-sm text-stone-500">Henleaze Runners</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
          <div>
            <h3 className="font-semibold text-stone-800">Paul R.</h3>
            <p className="text-sm text-stone-500">Walking FC</p>
          </div>
        </div>
        <p className="text-sm text-stone-400">More neighbours coming soon.</p>
      </div>
    </div>
  );
}
