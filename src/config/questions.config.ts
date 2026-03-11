export type QuestionType = "single-select" | "multi-select" | "text";

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
}

export const QUESTIONNAIRE_QUESTIONS: Question[] = [
  {
    id: "activity-types",
    text: "What types of activities interest you the most?",
    type: "multi-select",
    options: [
      { id: "coffee-social", label: "Coffee Mornings / Social Chats" },
      { id: "live-music", label: "Live music / Gigs" },
      { id: "fitness", label: "Fitness / Exercise" },
      { id: "walking", label: "Walking groups" },
      { id: "arts-crafts", label: "Arts and crafts" },
      { id: "learning", label: "Learning / Classes" },
      { id: "technology", label: "Technology help" },
      { id: "talks", label: "Talks / Lectures" },
      { id: "volunteering", label: "Volunteering" },
      { id: "gardening", label: "Gardening / Nature" },
      { id: "games", label: "Games / Quizzes" },
      { id: "food", label: "Food / Cooking" },
      { id: "dancing", label: "Dancing" },
      { id: "religion", label: "Religion & Spirituality" },
      { id: "movements", label: "Movements & Politics" },
    ],
  },
  {
    id: "music-events",
    text: "What type of music events do you enjoy?",
    type: "multi-select",
    options: [
      { id: "acoustic", label: "Acoustic / Folk" },
      { id: "jazz", label: "Jazz / Blues" },
      { id: "choir", label: "Choir / Singing groups" },
      { id: "classical", label: "Classical" },
      { id: "open-mic", label: "Open Mic" },
      { id: "tribute", label: "Tribute / Nostalgia" },
      { id: "quiet-seated", label: "Quiet seated performances" },
      { id: "lively", label: "Lively gigs" },
      { id: "any-music", label: "I'm open to any music nights" },
    ],
  },
  {
    id: "creative-activities",
    text: "Which creative activities interest you?",
    type: "multi-select",
    options: [
      { id: "painting", label: "Painting" },
      { id: "drawing", label: "Drawing" },
      { id: "photography", label: "Photography" },
      { id: "writing", label: "Writing" },
      { id: "knitting", label: "Knitting / Crochet" },
      { id: "craft-workshops", label: "Craft Workshops" },
      { id: "theatre", label: "Theatre / Performance" },
      { id: "any-creative", label: "I'm open to any creative activity" },
    ],
  },
  {
    id: "learning-events",
    text: "What kind of learning events interest you?",
    type: "multi-select",
    options: [
      { id: "tech-help", label: "Technology Help" },
      { id: "language", label: "Language Learning" },
      { id: "history", label: "History Talks" },
      { id: "personal-dev", label: "Personal Development" },
      { id: "creative-workshops", label: "Creative Workshops" },
      { id: "money-skills", label: "Money / Practical Life Skills" },
      { id: "business", label: "Business / Entrepreneurship" },
      { id: "health-wellbeing", label: "Health and wellbeing talks" },
    ],
  },
  {
    id: "social-level",
    text: "How social do you want your events to be?",
    type: "single-select",
    options: [
      { id: "independent", label: "Mostly independent / low interaction" },
      { id: "small-group", label: "Small friendly group" },
      { id: "moderate", label: "Moderately social" },
      { id: "very-social", label: "Very social / lots of interaction" },
    ],
  },
  {
    id: "event-structure",
    text: "Do you prefer structured events or informal ones?",
    type: "single-select",
    options: [
      { id: "structured", label: "Structured class or workshops" },
      { id: "informal", label: "Informal drop-in" },
      { id: "either", label: "Either" },
    ],
  },
  {
    id: "meet-new-people",
    text: "Would you like events that help you meet new people?",
    type: "single-select",
    options: [
      { id: "yes", label: "Yes, definitely" },
      { id: "no", label: "No, not important" },
      { id: "sometimes", label: "Sometimes" },
    ],
  },
  {
    id: "event-timing",
    text: "When do you usually prefer events?",
    type: "multi-select",
    options: [
      { id: "weekday-am", label: "Weekday mornings" },
      { id: "weekday-pm", label: "Weekday afternoons" },
      { id: "weekday-eve", label: "Weekday evenings" },
      { id: "weekend-am", label: "Weekend mornings" },
      { id: "weekend-pm", label: "Weekend afternoons" },
      { id: "weekend-eve", label: "Weekend evenings" },
    ],
  },
  {
    id: "event-duration",
    text: "How long do you like events to last?",
    type: "single-select",
    options: [
      { id: "under-1hr", label: "Under 1 hour" },
      { id: "1-2hrs", label: "1–2 hours" },
      { id: "2-3hrs", label: "2–3 hours" },
      { id: "half-day", label: "Half Day" },
      { id: "any-length", label: "Any Length" },
    ],
  },
  {
    id: "postcode",
    text: "What is your postcode? (helps us show events within your preferred travel distance)",
    type: "text",
    options: [],
  },
  {
    id: "travel-distance",
    text: "How far are you willing to travel?",
    type: "single-select",
    options: [
      { id: "under-1mile", label: "Under 1 mile" },
      { id: "1-2miles", label: "1–2 miles" },
      { id: "3-5miles", label: "3–5 miles" },
      { id: "anywhere-city", label: "Anywhere in the city" },
      { id: "online-only", label: "Online Only" },
    ],
  },
  {
    id: "travel-method",
    text: "How do you usually travel to events?",
    type: "multi-select",
    options: [
      { id: "walking", label: "Walking" },
      { id: "bus", label: "Bus/Public transport" },
      { id: "car", label: "Car" },
      { id: "cycling", label: "Cycling" },
      { id: "taxi", label: "Taxi / Lift" },
      { id: "mixed", label: "Mixed / depends" },
    ],
  },
  {
    id: "step-free-access",
    text: "Do you need step-free access?",
    type: "single-select",
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
      { id: "preferable", label: "Preferable" },
    ],
  },
  {
    id: "quiet-environment",
    text: "Would quiet environments be helpful?",
    type: "single-select",
    options: [
      { id: "yes", label: "Yes" },
      { id: "sometimes", label: "Sometimes" },
      { id: "no", label: "No" },
    ],
  },
  {
    id: "seating",
    text: "Do you prefer events with seating available?",
    type: "single-select",
    options: [
      { id: "essential", label: "Yes, essential" },
      { id: "preferable", label: "Preferable" },
      { id: "no", label: "No" },
    ],
  },
  {
    id: "spending",
    text: "How much are you comfortable spending on an event?",
    type: "single-select",
    options: [
      { id: "free", label: "Free events only" },
      { id: "up-to-5", label: "Up to £5" },
      { id: "up-to-10", label: "Up to £10" },
      { id: "up-to-20", label: "Up to £20" },
      { id: "any-price", label: "Any Price" },
    ],
  },
  {
    id: "attend-reasons",
    text: "What are the main reasons you want to attend events?",
    type: "multi-select",
    options: [
      { id: "meet-people", label: "Meet new people" },
      { id: "learn", label: "Learn something new" },
      { id: "fitness", label: "Improve fitness" },
      { id: "wellbeing", label: "Improve wellbeing" },
      { id: "music-culture", label: "Enjoy music / culture" },
      { id: "community", label: "Feel part of the community" },
      { id: "get-out", label: "Get out of the house" },
    ],
  },
  {
    id: "event-mood",
    text: "What mood of event do you prefer?",
    type: "multi-select",
    options: [
      { id: "calm", label: "Calm and relaxed" },
      { id: "friendly", label: "Friendly and chatty" },
      { id: "fun", label: "Fun and energetic" },
      { id: "creative", label: "Creative and inspiring" },
      { id: "educational", label: "Educational and focused" },
    ],
  },
  {
    id: "recommendation-frequency",
    text: "How often would you like recommendations?",
    type: "single-select",
    options: [
      { id: "daily", label: "Daily" },
      { id: "weekly", label: "Weekly" },
      { id: "fortnightly", label: "Fortnightly" },
      { id: "occasionally", label: "Occasionally" },
    ],
  },
  {
    id: "discover-new",
    text: "Are you interested in discovering events you might not normally try?",
    type: "single-select",
    options: [
      { id: "yes", label: "Yes" },
      { id: "maybe", label: "Maybe" },
      { id: "no", label: "No" },
    ],
  },
  {
    id: "familiarity-preference",
    text: "What best describes you?",
    type: "single-select",
    options: [
      { id: "new-things", label: "I enjoy trying new things" },
      { id: "familiar", label: "I enjoy familiar activities" },
      { id: "mix", label: "I like a mix of familiar and new" },
    ],
  },
];
