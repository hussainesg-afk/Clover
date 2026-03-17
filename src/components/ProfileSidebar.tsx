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

function GroupsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="7" r="4" />
      <circle cx="15" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M14 21v-2a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v2" />
    </svg>
  );
}

function NeighboursIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M12 11l2 2 4-4" />
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

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
                Respond to a curated set of questions, allowing Clover to generate personalised
                suggestions that reflect your individual characteristics on a deeper level.
              </p>
              <Link
                href="/questionnaire"
                onClick={onClose}
                className="mt-5 flex w-full justify-center rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-200"
              >
                Try it out
              </Link>
            </div>
          </div>

          {/* Discover */}
          <div className="px-4 pb-4">
            <Link
              href="/questionnaire"
              onClick={onClose}
              className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-stone-50"
            >
              <MapPinIcon className="h-6 w-6 text-blue-500" />
              <span className="font-semibold text-stone-700">Personalisation</span>
            </Link>
          </div>

          {/* Your Network */}
          <div className="flex-1 px-4 pb-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">
              Your Network
            </p>
            <nav className="space-y-1">
              <Link
                href="/social/groups"
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-stone-50"
              >
                <div className="relative shrink-0">
                  <GroupsIcon className="h-6 w-6 text-teal-600" />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    5
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-teal-800">Your Groups</p>
                  <p className="text-sm text-stone-500">Walking FC - Jazz Club - 2 more</p>
                </div>
              </Link>
              <Link
                href="/social/neighbours"
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-stone-50"
              >
                <div className="relative shrink-0">
                  <NeighboursIcon className="h-6 w-6 text-teal-600" />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    13
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-teal-800">Neighbours</p>
                  <p className="text-sm text-stone-500">Tina M., Dave J., Paul R., and 9 more</p>
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
          </div>
        </div>
      </aside>
    </>
  );
}
