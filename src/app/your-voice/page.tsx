"use client";

import { useState, useMemo } from "react";
import AuthGate from "@/components/AuthGate";
import LoadingScreen from "@/components/LoadingScreen";
import { db } from "@/lib/db";
import PostComposer from "@/components/voice/PostComposer";
import VoicePostCard, { type VoicePost } from "@/components/voice/VoicePostCard";
import { VOICE_FORUM_SECTIONS, type VoiceForumSectionId } from "@/config/voice-forum-sections.config";

const SECTION_ICONS: Record<VoiceForumSectionId, string> = {
  all: "check",
  sports: "sport",
  events: "star",
  "meet-up": "people",
  solo: "smiley",
  music: "headphones",
};

function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";
  const part = email.split("@")[0];
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function SmileyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v13zm10 0a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v13a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
  );
}

function SportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function FilterIcon({ type }: { type: string }) {
  const iconClass = "h-4 w-4 shrink-0";
  switch (type) {
    case "check":
      return <CheckIcon className={iconClass} />;
    case "sport":
      return <SportIcon className={iconClass} />;
    case "star":
      return <StarIcon className={iconClass} />;
    case "people":
      return <PeopleIcon className={iconClass} />;
    case "smiley":
      return <SmileyIcon className={iconClass} />;
    case "headphones":
      return <HeadphonesIcon className={iconClass} />;
    default:
      return null;
  }
}

function YourVoiceContent() {
  const user = db.useUser();
  const greetingName = getGreetingName(user?.email);
  const [activeFilter, setActiveFilter] = useState<VoiceForumSectionId>("all");

  const { isLoading, error, data } = db.useQuery({
    voice_posts: {
      $: {
        order: { createdAt: "desc" },
      },
      author: {},
      upvotedBy: {},
      comments: {
        $: { order: { createdAt: "asc" } },
        author: {},
      },
    },
  });

  const posts = (data?.voice_posts ?? []) as VoicePost[];
  const filteredPosts = useMemo(() => {
    if (activeFilter === "all") return posts;
    return posts.filter((p) => (p.category ?? "") === activeFilter);
  }, [posts, activeFilter]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-200" />
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {greetingName ? `Hello, ${greetingName}!` : "Hello!"}
          </h1>
          <p className="text-sm text-stone-500">Community forum</p>
        </div>
      </div>

      {user && <PostComposer userId={user.id} />}

      <section className="mb-6" aria-label="Forum sections">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Forum sections</h2>
        <p className="mt-1 text-sm text-stone-600">Pick a board to read posts in that topic, or stay on all topics.</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {VOICE_FORUM_SECTIONS.map((section) => {
            const isActive = activeFilter === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveFilter(section.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <FilterIcon type={SECTION_ICONS[section.id]} />
                {section.label}
              </button>
            );
          })}
        </div>
      </section>

      {isLoading ? (
        <LoadingScreen />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 text-sm">Please try again later.</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
          <p className="font-medium text-stone-600">
            {posts.length === 0
              ? "No posts yet. Start a thread on any board."
              : "No posts in this section yet. Try another board or all topics."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <VoicePostCard key={post.id} post={post} currentUserId={user?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function YourVoicePage() {
  return (
    <AuthGate>
      <YourVoiceContent />
    </AuthGate>
  );
}
