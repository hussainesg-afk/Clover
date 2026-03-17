"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGate from "@/components/AuthGate";

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

const tabs = [
  { href: "/social/friends", label: "Friends", icon: FriendsIcon },
  { href: "/social/groups", label: "Your Groups", icon: GroupsIcon },
  { href: "/social/neighbours", label: "Neighbours", icon: NeighboursIcon },
  { href: "/social/messages", label: "Messages", icon: MessagesIcon },
];

function SocialLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Social</h1>
        <p className="mt-1 text-stone-600">Your groups, neighbours, and messages.</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Tab navigation - horizontal on mobile, vertical on desktop */}
        <nav className="flex shrink-0 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {tabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition whitespace-nowrap lg:w-[220px] ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white text-stone-700 shadow-sm ring-1 ring-stone-200/80 hover:bg-stone-50"
                }`}
              >
                <Icon className={`h-6 w-6 shrink-0 ${isActive ? "text-white" : "text-teal-600"}`} />
                <span className="font-semibold">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main content area */}
        <div className="min-w-0 flex-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <SocialLayoutInner>{children}</SocialLayoutInner>
    </AuthGate>
  );
}
