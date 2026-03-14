"use client";

export default function MessagesPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800">Messages</h2>
      <p className="mt-2 text-stone-600">
        Direct messages with your neighbours and group members.
      </p>
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-stone-800">Dave J.</h3>
            <p className="truncate text-sm text-stone-500">
              Let&apos;s make it happen, see you Saturday...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-stone-300" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-stone-800">Tina M.</h3>
            <p className="truncate text-sm text-stone-500">
              Jazz Club is on for next week...
            </p>
          </div>
        </div>
        <p className="text-sm text-stone-400">More messages coming soon.</p>
      </div>
    </div>
  );
}
