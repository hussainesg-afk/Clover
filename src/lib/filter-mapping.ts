/**
 * Maps questionnaire option IDs to event attribute values.
 * Supports both Bristol Excel schema and alternative InstantDB schema (tags, event type, cost).
 * Used by filter-events.ts to match user responses to events.
 */

/** "*" means match any event value for this dimension (user is flexible) */
const ANY = "*";

/** Tag keywords for activity-types when primaryCategory is missing (from tags column) */
export const ACTIVITY_TO_TAG_KEYWORDS: Record<string, string[]> = {
  "coffee-social": ["coffee", "social", "chat", "community"],
  "live-music": ["music", "gig", "dance", "concert"],
  "fitness": ["fitness", "exercise", "sport"],
  "walking": ["walking", "walk"],
  "arts-crafts": ["arts", "craft", "creative", "theatre", "visual arts", "heritage"],
  "learning": ["workshop", "learn", "talk", "lecture", "technology"],
  "technology": ["technology", "tech"],
  "talks": ["talk", "lecture", "heritage"],
  "volunteering": ["community", "nature", "garden"],
  "gardening": ["garden", "nature"],
  "games": ["games", "quiz", "activity"],
  "food": ["food", "cooking"],
  "dancing": ["dance", "music"],
  "religion": ["talk", "lecture"],
  "movements": ["talk", "lecture", "community"],
};

/** Tag keywords for creative-activities */
export const CREATIVE_TO_TAG_KEYWORDS: Record<string, string[]> = {
  "painting": ["arts", "visual arts", "creative"],
  "drawing": ["arts", "visual arts", "creative"],
  "photography": ["arts", "visual arts"],
  "writing": ["arts", "creative"],
  "knitting": ["craft", "arts"],
  "craft-workshops": ["craft", "workshop", "arts"],
  "theatre": ["theatre", "arts", "performance"],
  "any-creative": [],
};

/** Tag keywords for music-events */
export const MUSIC_TO_TAG_KEYWORDS: Record<string, string[]> = {
  "acoustic": ["acoustic", "folk", "music"],
  "jazz": ["jazz", "music"],
  "choir": ["choir", "music"],
  "classical": ["classical", "music"],
  "open-mic": ["music"],
  "tribute": ["music"],
  "quiet-seated": ["music"],
  "lively": ["music", "dance"],
  "any-music": [],
};

/** Tag keywords for learning-events */
export const LEARNING_TO_TAG_KEYWORDS: Record<string, string[]> = {
  "tech-help": ["technology", "tech", "workshop"],
  "language": ["language", "learn"],
  "history": ["history", "heritage"],
  "personal-dev": ["workshop", "learn"],
  "creative-workshops": ["creative", "workshop"],
  "money-skills": ["workshop", "learn"],
  "business": ["workshop", "learn"],
  "health-wellbeing": ["wellbeing", "health", "workshop"],
};

export const OPTION_TO_EVENT_ATTR: Record<string, Record<string, string>> = {
  "activity-types": {
    "coffee-social": "Coffee Mornings / Social Chats",
    "live-music": "Live music / Gigs",
    "fitness": "Fitness / Exercise",
    "walking": "Walking groups",
    "arts-crafts": "Arts and Crafts",
    "learning": "Talks / Lectures",
    "technology": "Technology Help",
    "talks": "Talks / Lectures",
    "volunteering": "Gardening / Nature",
    "gardening": "Gardening / Nature",
    "games": "Games / Quizzes",
    "food": "Games / Quizzes",
    "dancing": "Live music / Gigs",
    "religion": "Talks / Lectures",
    "movements": "Talks / Lectures",
  },
  "music-events": {
    "acoustic": "Acoustic / Folk",
    "jazz": ANY,
    "choir": ANY,
    "classical": ANY,
    "open-mic": ANY,
    "tribute": ANY,
    "quiet-seated": ANY,
    "lively": ANY,
    "any-music": ANY,
  },
  "creative-activities": {
    "painting": ANY,
    "drawing": ANY,
    "photography": ANY,
    "writing": ANY,
    "knitting": ANY,
    "craft-workshops": "Craft Workshops",
    "theatre": ANY,
    "any-creative": ANY,
  },
  "learning-events": {
    "tech-help": "Technology Help",
    "language": ANY,
    "history": "History Talks",
    "personal-dev": ANY,
    "creative-workshops": "Creative Workshops",
    "money-skills": ANY,
    "business": ANY,
    "health-wellbeing": ANY,
  },
  "social-level": {
    "independent": ANY,
    "small-group": "Small friendly group",
    "moderate": ANY,
    "very-social": "Very social / lots of interaction",
  },
  "event-structure": {
    "structured": "Workshop",
    "informal": "Informal drop-in",
    "either": ANY,
  },
  "lgbtq-preference": {
    "yes": "Yes",
    "no": ANY,
    "prefer-not-to-say": ANY,
  },
  "event-timing": {
    "weekday-am": "Weekday mornings",
    "weekday-pm": "Weekday afternoons",
    "weekday-eve": "Weekday evenings",
    "weekend-am": "Weekend mornings",
    "weekend-pm": "Weekend afternoons",
    "weekend-eve": "Weekend evenings",
  },
  "event-duration": {
    "under-1hr": "1-2 hours",
    "1-2hrs": "1-2 hours",
    "2-3hrs": "2-3 hours",
    "half-day": "2-3 hours",
    "any-length": ANY,
  },
  "travel-method": {
    "walking": "Walking",
    "bus": "Bus/Public transport",
    "car": ANY,
    "cycling": ANY,
    "taxi": ANY,
    "mixed": ANY,
  },
  "step-free-access": {
    "yes": "Yes",
    "no": ANY,
    "preferable": "Preferable",
  },
  "quiet-environment": {
    "yes": "Quiet",
    "sometimes": ANY,
    "no": "Moderate",
  },
  "seating": {
    "essential": "Yes, essential",
    "preferable": "Yes, essential",
    "no": ANY,
  },
  "spending": {
    "free": "Free events only",
    "up-to-5": "Up to £5",
    "up-to-10": "Up to £10",
    "up-to-20": "Up to £20",
    "any-price": ANY,
  },
  "attend-reasons": {
    "meet-people": "Meet new people",
    "learn": "Learn something new",
    "fitness": "Improve fitness",
    "wellbeing": "Improve wellbeing",
    "music-culture": "Enjoy music / culture",
    "community": "Feel part of the community",
    "get-out": "Feel part of the community",
  },
  "event-mood": {
    "calm": "Calm and relaxed",
    "friendly": "Friendly and chatty",
    "fun": "Fun and energetic",
    "creative": "Creative and inspiring",
    "educational": "Educational and focused",
  },
  "travel-distance": { "under-1mile": ANY, "1-2miles": ANY, "3-5miles": ANY, "anywhere-city": ANY, "online-only": ANY },
};

export const QUESTION_TO_EVENT_ATTR: Record<string, string> = {
  "activity-types": "primaryCategory",
  "music-events": "musicType",
  "creative-activities": "creativeType",
  "learning-events": "learningType",
  "social-level": "socialLevel",
  "event-structure": "eventFormat",
  "lgbtq-preference": "lgbtqFocus",
  "event-timing": "eventTime",
  "event-duration": "durationBand",
  "travel-method": "transport",
  "step-free-access": "stepFree",
  "quiet-environment": "noise",
  "seating": "seating",
  "spending": "priceBand",
  "attend-reasons": "primaryBenefit",
  "event-mood": "eventMood",
  "postcode": "_skip",
  "travel-distance": "_skip",
  "employment-status": "_skip",
  "recent-life-changes": "_skip",
  "health-conditions": "_skip",
  "social-confidence": "_skip",
  "referral-source": "_skip",
};
