"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import AuthGate from "@/components/AuthGate";
import LoadingScreen from "@/components/LoadingScreen";

type UserSettingsRow = {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  locationSharingEnabled: boolean;
  profileVisibility: string;
};

const PROFILE_VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", description: "Your profile and activity are visible to other Clover users" },
  { value: "friends", label: "Friends only", description: "Only people in your network can see your profile" },
  { value: "private", label: "Private", description: "Your profile is hidden from everyone" },
];

function SettingsFormInner({
  userId,
  existingSettings,
}: {
  userId: string;
  existingSettings: UserSettingsRow | null;
}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (existingSettings) {
      setNotificationsEnabled(existingSettings.notificationsEnabled);
      setLocationSharingEnabled(existingSettings.locationSharingEnabled);
      setProfileVisibility(existingSettings.profileVisibility);
    }
  }, [existingSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      if (existingSettings) {
        await db.transact([
          db.tx.user_settings[existingSettings.id].update({
            notificationsEnabled,
            locationSharingEnabled,
            profileVisibility,
          }),
        ]);
      } else {
        await db.transact([
          db.tx.user_settings[id()].update({
            userId,
            notificationsEnabled,
            locationSharingEnabled,
            profileVisibility,
          }),
        ]);
      }
      setSaveSuccess(true);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
      <p className="mt-1 text-stone-600">
        Manage your notifications, location sharing, and privacy preferences.
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {saveSuccess && (
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            Settings saved successfully.
          </div>
        )}

        {/* Notifications */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Notifications</h2>
          <p className="mt-1 text-sm text-stone-600">
            Receive reminders and updates about events you might enjoy.
          </p>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-teal-600"
            />
            <span className="font-medium text-stone-700">Enable notifications</span>
          </label>
        </section>

        {/* Location */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Location</h2>
          <p className="mt-1 text-sm text-stone-600">
            Allow Clover to use your location for personalised event recommendations.
          </p>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={locationSharingEnabled}
              onChange={(e) => setLocationSharingEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-teal-600"
            />
            <span className="font-medium text-stone-700">Share location for recommendations</span>
          </label>
          <p className="mt-2 text-xs text-stone-500">
            Your postcode from the questionnaire is used to find events near you. Update it in{" "}
            <Link href="/questionnaire" className="text-teal-600 underline hover:text-teal-700">
              the questionnaire
            </Link>
            .
          </p>
        </section>

        {/* Privacy */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Privacy</h2>
          <p className="mt-1 text-sm text-stone-600">
            Control who can see your profile and activity on Clover.
          </p>
          <div className="mt-4 space-y-3">
            {PROFILE_VISIBILITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  profileVisibility === opt.value
                    ? "border-teal-300 bg-teal-50/50"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="profileVisibility"
                  value={opt.value}
                  checked={profileVisibility === opt.value}
                  onChange={() => setProfileVisibility(opt.value)}
                  className="mt-1 h-4 w-4 text-teal-600"
                />
                <div>
                  <span className="font-medium text-stone-700">{opt.label}</span>
                  <p className="mt-0.5 text-sm text-stone-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Advanced Personalisation */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Advanced Personalisation</h2>
          <p className="mt-1 text-sm text-stone-600">
            Help us understand you better to improve your event recommendations.
          </p>
          <Link
            href="/settings/personalisation"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-teal-600 hover:to-cyan-600 transition"
          >
            Go to Advanced Personalisation
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-medium text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-stone-200 bg-white px-6 py-3 text-center font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function SettingsForm() {
  const user = db.useUser();
  const userId = user?.id;
  const { data } = db.useQuery({ user_settings: {} });
  const allSettings = (data?.user_settings ?? []) as UserSettingsRow[];
  const mySettings = userId ? allSettings.find((s) => s.userId === userId) ?? null : null;

  if (!userId) {
    return <LoadingScreen />;
  }

  return (
    <SettingsFormInner
      key={mySettings?.id ?? "new"}
      userId={userId}
      existingSettings={mySettings}
    />
  );
}

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsForm />
    </AuthGate>
  );
}
