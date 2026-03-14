"use client";

import { useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "events", label: "Events" },
  { id: "meet-up", label: "Meet-up" },
  { id: "solo", label: "Solo" },
  { id: "music", label: "Music" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface PostComposerProps {
  userId: string;
  onPostCreated?: () => void;
}

export default function PostComposer({ userId, onPostCreated }: PostComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CategoryId | "">("");
  const [postCode, setPostCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Please write something to share.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const postId = id();
      await db.transact([
        db.tx.voice_posts[postId]
          .update({
            body: trimmed,
            createdAt: Date.now(),
            category: category && category !== "all" ? category : undefined,
            postCode: postCode.trim() || undefined,
          })
          .link({ author: userId }),
      ]);
      setBody("");
      setCategory("");
      setPostCode("");
      setExpanded(false);
      onPostCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setExpanded(false);
    setBody("");
    setCategory("");
    setPostCode("");
    setError(null);
  };

  if (!expanded) {
    return (
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-4 text-left shadow-sm transition hover:border-emerald-300 hover:from-emerald-100 hover:to-teal-100"
        >
          <span className="font-medium text-stone-600">Share Something?</span>
          <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
            Post
          </span>
        </button>
        <p className="mt-2 text-sm text-stone-500">
          Pitch ideas - Gauge interest - Make it happen...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What would you like to share? e.g. Where is the walking group in Hengrove, who'd be keen to start it again?"
        rows={4}
        className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
        disabled={isSubmitting}
        autoFocus
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId | "")}
          className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-700 focus:border-teal-400 focus:outline-none"
        >
          <option value="">Category (optional)</option>
          {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={postCode}
          onChange={(e) => setPostCode(e.target.value)}
          placeholder="Postcode (optional)"
          className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-400 focus:border-teal-400 focus:outline-none"
          disabled={isSubmitting}
        />
      </div>
      {error && (
        <p className="mt-3 text-sm text-rose-600">{error}</p>
      )}
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
