"use client";

import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";

const CATEGORY_COLORS: Record<string, string> = {
  events: "bg-amber-100 text-amber-800",
  "meet-up": "bg-sky-100 text-sky-800",
  solo: "bg-emerald-100 text-emerald-800",
  music: "bg-violet-100 text-violet-800",
};

const INTEREST_CAP = 50;

function getInitials(user: { displayName?: string | null; email?: string | null; id?: string } | null): string {
  if (!user) return "??";
  if (user.displayName && user.displayName.length >= 2) {
    const parts = user.displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.displayName.slice(0, 2).toUpperCase();
  }
  if (user.email) {
    const part = user.email.split("@")[0];
    if (part && part.length >= 2) return part.slice(0, 2).toUpperCase();
    if (part) return part[0].toUpperCase();
  }
  if (user.id && user.id.length >= 2) return user.id.slice(0, 2).toUpperCase();
  return "??";
}

function getDisplayName(user: { displayName?: string | null; email?: string | null } | null): string {
  if (!user) return "Anonymous";
  if (user.displayName) return user.displayName;
  if (user.email) {
    const part = user.email.split("@")[0];
    return part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : "Anonymous";
  }
  return "Anonymous";
}

export interface VoicePost {
  id: string;
  body: string;
  createdAt: number;
  category?: string | null;
  postCode?: string | null;
  author?: { id: string; displayName?: string | null; email?: string | null } | null;
  upvotedBy?: { id: string; displayName?: string | null; email?: string | null }[] | null;
}

interface VoicePostCardProps {
  post: VoicePost;
  currentUserId: string | null;
}

function ThumbsUpIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${filled ? "fill-teal-600 text-teal-600" : "text-stone-400"}`}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714.211 1.412.608 2.006L7 11v9m7-10l-4-4m0 0l-4 4m4-4v4"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className="h-5 w-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="h-5 w-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

export default function VoicePostCard({ post, currentUserId }: VoicePostCardProps) {
  const upvoters = post.upvotedBy ?? [];
  const upvoteCount = upvoters.length;
  const hasUpvoted = currentUserId ? upvoters.some((u) => u.id === currentUserId) : false;
  const progress = Math.min(upvoteCount / INTEREST_CAP, 1);

  const handleUpvote = async () => {
    if (!currentUserId) return;
    try {
      if (hasUpvoted) {
        await db.transact(db.tx.voice_posts[post.id].unlink({ upvotedBy: currentUserId }));
      } else {
        await db.transact(db.tx.voice_posts[post.id].link({ upvotedBy: currentUserId }));
      }
    } catch {
      // Ignore errors for now
    }
  };

  const categoryLabel = post.category
    ? post.category.charAt(0).toUpperCase() + post.category.slice(1).replace(/-/g, " ")
    : null;

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-800"
            aria-hidden
          >
            {getInitials(post.author)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-stone-900">{getDisplayName(post.author)}</p>
            <p className="text-sm text-stone-500">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        {categoryLabel && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              CATEGORY_COLORS[post.category ?? ""] ?? "bg-stone-100 text-stone-700"
            }`}
          >
            {categoryLabel}
          </span>
        )}
      </div>

      <p className="mt-4 text-stone-700">{post.body}</p>

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-stone-500">Neighbourhood Interest</p>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {upvoters.slice(0, 3).map((u) => (
            <div
              key={u.id}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-xs font-medium text-stone-700"
              title={getDisplayName(u)}
            >
              {getInitials(u)}
            </div>
          ))}
          {upvoteCount > 3 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-medium text-stone-500">
              +{upvoteCount - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              hasUpvoted
                ? "bg-teal-50 text-teal-700"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50"
            }`}
            aria-pressed={hasUpvoted}
          >
            <ThumbsUpIcon filled={hasUpvoted} />
            <span>{upvoteCount}</span>
          </button>
          <button type="button" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100" aria-label="Comment">
            <CommentIcon />
          </button>
          <button type="button" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100" aria-label="Share">
            <ShareIcon />
          </button>
        </div>
      </div>
    </article>
  );
}
