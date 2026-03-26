/**
 * Forum-style boards for Your Voice: ids are stored on voice_posts.category.
 */
export const VOICE_FORUM_SECTIONS = [
  { id: "all", label: "All topics" },
  { id: "sports", label: "Sports" },
  { id: "events", label: "Events" },
  { id: "meet-up", label: "Meet-ups" },
  { id: "solo", label: "Solo" },
  { id: "music", label: "Music" },
] as const;

export type VoiceForumSectionId = (typeof VOICE_FORUM_SECTIONS)[number]["id"];

export function voiceForumSectionLabel(categoryId: string | null | undefined): string {
  if (!categoryId) return "";
  const row = VOICE_FORUM_SECTIONS.find((s) => s.id === categoryId);
  return row?.label ?? categoryId;
}

export const VOICE_FORUM_COMPOSER_OPTIONS = VOICE_FORUM_SECTIONS.filter(
  (s) => s.id !== "all",
);
