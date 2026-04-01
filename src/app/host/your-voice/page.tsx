"use client";

import Link from "next/link";
import HostAuthGate from "@/components/HostAuthGate";
import { db } from "@/lib/db";
import PostComposer from "@/components/voice/PostComposer";
import VoicePostCard, { type VoicePost } from "@/components/voice/VoicePostCard";
import LoadingScreen from "@/components/LoadingScreen";

function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";
  const part = email.split("@")[0];
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function HostYourVoiceContent() {
  const user = db.useUser();
  const greetingName = getGreetingName(user?.email);

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

  return (
    <div>
      <Link
        href="/host"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        Back to Host Dashboard
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-200" />
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {greetingName ? `Hello, ${greetingName}!` : "Hello!"}
          </h1>
          <p className="text-sm text-stone-500">Your Voice</p>
        </div>
      </div>

      {user && <PostComposer userId={user.id} />}

      {isLoading ? (
        <LoadingScreen />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 text-sm">Please try again later.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
          <p className="font-medium text-stone-600">
            No posts yet. Be the first to share something!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <VoicePostCard key={post.id} post={post} currentUserId={user?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HostYourVoicePage() {
  return (
    <HostAuthGate>
      <HostYourVoiceContent />
    </HostAuthGate>
  );
}
