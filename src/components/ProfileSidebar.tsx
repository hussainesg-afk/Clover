"use client";

import { useEffect } from "react";
import Link from "next/link";
import CloverIcon from "@/components/CloverIcon";

function getDisplayName(email: string | null | undefined): string {
  if (!email) return "User";
  const part = email.split("@")[0];
  if (!part) return "User";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function FriendsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MessagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 9a3 3 0 0 1 0 6v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"
      />
      <path strokeLinecap="round" d="M13 5v2M13 17v2M13 11v2" />
    </svg>
  );
}

function HealthIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string | null } | null;
}

export default function ProfileSidebar({ isOpen, onClose, user }: ProfileSidebarProps) {
  const displayName = getDisplayName(user?.email);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close sidebar"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className={`fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[min(320px,85vw)] max-w-[320px] transform bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Profile header - dark green */}
          <div className="bg-teal-800 px-5 pb-6 pt-8">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 rounded-full bg-stone-300" aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-white">{displayName}</h2>
                <p className="mt-0.5 text-sm text-white/90">Henleaze, Bristol</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-teal-600/80 px-4 py-3">
              <p className="text-sm leading-relaxed text-white">
                View the direct health benefits of your logged activities.
              </p>
            </div>
          </div>

          {/* Optimise Clover card - coral red */}
          <div className="px-4 py-5">
            <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 p-5 text-white shadow-lg">
              <h3 className="text-center text-lg font-bold">Optimise Clover For You</h3>
              <div className="mx-auto mt-3 flex h-16 w-16 justify-center text-white/90">
                <CloverIcon size={64} className="text-white/90" />
              </div>
              <p className="mt-4 text-center text-sm leading-relaxed text-white/95">
                Answer the questionnaire so Clover can match events to your preferences, location,
                and how you like to take part.
              </p>
              <Link
                href="/questionnaire"
                onClick={onClose}
                className="mt-5 flex w-full justify-center rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-200"
              >
                Complete questionnaire
              </Link>
            </div>
          </div>

          {/* Your Network */}
          <div className="flex-1 px-4 pb-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">
              Your Network
            </p>
            <nav className="space-y-1">
              <Link
                href="/social/friends"
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-stone-50"
              >
                <FriendsIcon className="h-6 w-6 shrink-0 text-teal-600" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-teal-800">Friends</p>
                  <p className="text-sm text-stone-500">Requests and your friends list</p>
                </div>
              </Link>
              <Link
                href="/social/messages"
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-stone-50"
              >
                <MessagesIcon className="h-6 w-6 shrink-0 text-teal-600" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-teal-800">Messages</p>
                  <p className="text-sm text-stone-500">Direct messages with friends</p>
                </div>
              </Link>
              <Link
                href="/my-bookings"
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-stone-50"
              >
                <BookingsIcon className="h-6 w-6 shrink-0 text-violet-600" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-violet-800">My bookings</p>
                  <p className="text-sm text-stone-500">Events you are going to and invites</p>
                </div>
              </Link>
            </nav>

            <div className="my-4 border-t border-stone-200" />

            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">
              Account
            </p>
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-stone-50"
            >
              <SettingsIcon className="h-6 w-6 shrink-0 text-stone-500" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-700">Settings</p>
                <p className="text-sm text-stone-500">Notifications, Privacy, Location</p>
              </div>
            </Link>
            <Link
              href="/settings/health"
              onClick={onClose}
              className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-stone-50"
            >
              <HealthIcon className="h-6 w-6 shrink-0 text-rose-500" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-700">Health Data</p>
                <p className="text-sm text-stone-500">Link your Apple Health activity</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
