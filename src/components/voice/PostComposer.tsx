"use client";

import { useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { VOICE_BREADTH_SEEDS } from "@/config/voice-breadth-seeds";
import {
  VOICE_FORUM_COMPOSER_OPTIONS,
  type VoiceForumSectionId,
} from "@/config/voice-forum-sections.config";

type ComposerCategoryId = Exclude<VoiceForumSectionId, "all">;

const SOCIAL_LEVELS = [
  { id: "low", label: "Low interaction" },
  { id: "moderate", label: "Moderate" },
  { id: "high", label: "Very social" },
] as const;

const PREFERRED_TIMES = [
  { id: "Weekday mornings", label: "Weekday mornings" },
  { id: "Weekday afternoons", label: "Weekday afternoons" },
  { id: "Weekday evenings", label: "Weekday evenings" },
  { id: "Weekend mornings", label: "Weekend mornings" },
  { id: "Weekend afternoons", label: "Weekend afternoons" },
  { id: "Weekend evenings", label: "Weekend evenings" },
] as const;

const GROUP_SIZES = [
  { id: "1-5", label: "1-5 people" },
  { id: "5-10", label: "5-10 people" },
  { id: "10-20", label: "10-20 people" },
  { id: "20+", label: "20+ people" },
] as const;

interface PostComposerProps {
  userId: string;
  onPostCreated?: () => void;
}

export default function PostComposer({ userId, onPostCreated }: PostComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ComposerCategoryId | "">("");
  const [postCode, setPostCode] = useState("");
  const [socialLevel, setSocialLevel] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [groupSize, setGroupSize] = useState("");
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
            category: category || undefined,
            postCode: postCode.trim() || undefined,
            socialLevel: socialLevel || undefined,
            preferredTime: preferredTime || undefined,
            groupSize: groupSize || undefined,
          })
          .link({ author: userId }),
      ]);
      setBody("");
      setCategory("");
      setPostCode("");
      setSocialLevel("");
      setPreferredTime("");
      setGroupSize("");
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
    setSocialLevel("");
    setPreferredTime("");
    setGroupSize("");
    setError(null);
  };

  const appendIdeaStarter = (line: string) => {
    setBody((prev) => {
      const t = prev.trim();
      return t ? `${t}\n${line}` : line;
    });
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

  const selectClass =
    "rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-700 focus:border-teal-400 focus:outline-none";

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

      <details className="mt-4 rounded-xl border border-stone-200 bg-stone-50/80">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-stone-700">
          Idea starters ({VOICE_BREADTH_SEEDS.length}) — tap to add to your post
        </summary>
        <div className="max-h-52 overflow-y-auto border-t border-stone-200 px-3 pb-3 pt-2">
          <div className="flex flex-wrap gap-2">
            {VOICE_BREADTH_SEEDS.map((line) => (
              <button
                key={line}
                type="button"
                disabled={isSubmitting}
                onClick={() => appendIdeaStarter(line)}
                className="max-w-full rounded-lg bg-white px-2.5 py-1.5 text-left text-xs leading-snug text-stone-700 ring-1 ring-stone-200 transition hover:bg-teal-50 hover:ring-teal-200 disabled:opacity-50"
              >
                {line}
              </button>
            ))}
          </div>
        </div>
      </details>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ComposerCategoryId | "")}
          className={selectClass}
        >
          <option value="">Board (optional)</option>
          {VOICE_FORUM_COMPOSER_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={postCode}
          onChange={(e) => setPostCode(e.target.value)}
          placeholder="Postcode (e.g. BS3 1AB)"
          className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-400 focus:border-teal-400 focus:outline-none"
          disabled={isSubmitting}
        />

        <select
          value={socialLevel}
          onChange={(e) => setSocialLevel(e.target.value)}
          className={selectClass}
        >
          <option value="">Social level (optional)</option>
          {SOCIAL_LEVELS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          className={selectClass}
        >
          <option value="">Preferred time (optional)</option>
          {PREFERRED_TIMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
          className={selectClass}
        >
          <option value="">Group size (optional)</option>
          {GROUP_SIZES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
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
