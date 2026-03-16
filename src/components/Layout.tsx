"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { db } from "@/lib/db";
import { getFirebaseAuth } from "@/lib/firebase";
import FirebaseAuthSync from "@/components/FirebaseAuthSync";
import CloverIcon from "@/components/CloverIcon";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const communityNavItems = [
  { href: "/", label: "Home", icon: HomeIcon, color: "text-red-500" },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon, color: "text-amber-500" },
  { href: "/for-you", label: "For You", icon: SparklesIcon, color: "text-emerald-500" },
  { href: "/your-voice", label: "Your Voice", icon: VoiceIcon, color: "text-emerald-600" },
];

const hostNavItems = [
  { href: "/host", label: "Home", icon: HomeIcon, color: "text-teal-600" },
  { href: "/host/events", label: "Events", icon: SparklesIcon, color: "text-teal-600" },
  { href: "/host/calendar", label: "Calendar", icon: CalendarIcon, color: "text-teal-600" },
];

function HomeIcon({ active, color }: { active?: boolean; color?: string }) {
  return (
    <svg
      className={`h-6 w-6 ${active ? color ?? "text-red-500" : "text-stone-400"}`}
      fill={active ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CalendarIcon({ active, color }: { active?: boolean; color?: string }) {
  return (
    <svg
      className={`h-6 w-6 ${active ? color ?? "text-amber-500" : "text-stone-400"}`}
      fill={active ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function SparklesIcon({ active, color }: { active?: boolean; color?: string }) {
  return (
    <svg
      className={`h-6 w-6 ${active ? color ?? "text-emerald-500" : "text-stone-400"}`}
      fill={active ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function VoiceIcon({ active, color }: { active?: boolean; color?: string }) {
  const c = active ? (color ?? "text-emerald-600") : "text-stone-400";
  return (
    <svg
      className={`h-6 w-6 ${c}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {/* Sound wave / equalizer: 5 vertical bars (short, medium, tall, medium, short) */}
      <rect x="3" y="12" width="2" height="4" rx="1" />
      <rect x="7" y="10" width="2" height="8" rx="1" />
      <rect x="11" y="6" width="2" height="16" rx="1" />
      <rect x="15" y="10" width="2" height="8" rx="1" />
      <rect x="19" y="12" width="2" height="4" rx="1" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
function ForwardArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = db.useAuth();

  return (
    <div className="min-h-screen bg-stone-100 clover-pattern">
      <FirebaseAuthSync />
      <header className="sticky top-0 z-20 border-b border-teal-100/80 bg-white/95 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex min-w-[72px] items-center gap-1">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
              aria-label="Back"
            >
              <BackArrowIcon />
            </button>
            <button
              type="button"
              onClick={() => window.history.forward()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
              aria-label="Forward"
            >
              <ForwardArrowIcon />
            </button>
          </div>
          <Link
            href={pathname.startsWith("/host") ? "/host" : "/"}
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
          >
            <CloverIcon size={28} className="text-teal-600" />
            <span className="text-xl font-semibold tracking-tight text-stone-800">Clover</span>
          </Link>
          <div className="flex min-w-[72px] justify-end items-center gap-3">
            {user ? (
              <>
                <span className="hidden max-w-[140px] truncate text-sm text-stone-500 sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={async () => {
                    const firebaseAuth = getFirebaseAuth();
                    if (firebaseAuth) {
                      try {
                        await signOut(firebaseAuth);
                      } catch {
                        // Ignore if not signed into Firebase
                      }
                    }
                    db.auth.signOut();
                  }}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm transition hover:border-amber-200 hover:bg-amber-50/50 hover:text-stone-900"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href={pathname.startsWith("/host") ? "/host" : "/"}
                className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:from-teal-600 hover:to-cyan-600"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className={`mx-auto max-w-5xl px-4 pt-6 ${user ? "pb-32" : "pb-8"}`}>
        {children}
      </main>

      {user && (
      <nav className="fixed bottom-4 left-4 right-4 z-20 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md">
        <div className="flex items-center justify-around rounded-2xl bg-white/95 px-4 py-3 shadow-lg shadow-stone-200/50 ring-1 ring-stone-200/80 backdrop-blur-sm">
          {(pathname.startsWith("/host") ? hostNavItems : communityNavItems).map(({ href, label, icon: Icon, color }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition sm:flex-row sm:gap-2 ${
                  isActive
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                }`}
              >
                <Icon active={isActive} color={color} />
                <span className="text-xs font-medium sm:text-sm">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LayoutInner>{children}</LayoutInner>
      </GoogleOAuthProvider>
    );
  }
  return <LayoutInner>{children}</LayoutInner>;
}
