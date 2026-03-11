/**
 * Maps event primaryCategory to representative images.
 * Uses Unsplash Source-style URLs (deterministic per category).
 */
const CATEGORY_IMAGES: Record<string, string> = {
  "Live music / Gigs": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "Gardening / Nature": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
  "Fitness / Exercise": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  "Arts and Crafts": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
  "Technology Help": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
  "Talks / Lectures": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  "Coffee Mornings / Social Chats": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  "Walking groups": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
  "Games / Quizzes": "https://images.unsplash.com/photo-1611195974226-aee4c9d778c5?w=800&q=80",
  "Food / Cooking": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
  "Dancing": "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80",
  "Religion & Spirituality": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  "Movements & Politics": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
  "Volunteering": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";

export function getEventImageUrl(primaryCategory?: string): string {
  if (!primaryCategory) return DEFAULT_IMAGE;
  return CATEGORY_IMAGES[primaryCategory] ?? DEFAULT_IMAGE;
}
