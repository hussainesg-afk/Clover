/**
 * Organiser event submission questionnaire.
 * Maps 1:1 to Excel/InstantDB event schema.
 * Option values must match the events table for filtering compatibility.
 */

export type OrganiserQuestionType = "text" | "single-select";

export interface OrganiserQuestionOption {
  id: string;
  label: string;
}

export interface OrganiserQuestion {
  id: string;
  text: string;
  type: OrganiserQuestionType;
  options: OrganiserQuestionOption[];
  required?: boolean;
}

/** Maps questionId to InstantDB event field name */
export const ORGANISER_QUESTION_TO_EVENT_FIELD: Record<string, string> = {
  title: "title",
  description: "description",
  startDateTime: "startDateTime",
  postCode: "postCode",
  address: "address",
  venueName: "venueName",
  bookingUrl: "bookingUrl",
  accessibility: "accessibility",
  primaryCategory: "primaryCategory",
  costType: "costType",
  musicType: "musicType",
  creativeType: "creativeType",
  learningType: "learningType",
  socialLevel: "socialLevel",
  eventFormat: "eventFormat",
  meetingPeople: "meetingPeople",
  eventTime: "eventTime",
  durationBand: "durationBand",
  transport: "transport",
  stepFree: "stepFree",
  noise: "noise",
  seating: "seating",
  priceBand: "priceBand",
  primaryBenefit: "primaryBenefit",
  eventMood: "eventMood",
  lgbtqFocus: "lgbtqFocus",
};

export const ORGANISER_EVENT_QUESTIONS: OrganiserQuestion[] = [
  {
    id: "title",
    text: "What's the name of your event?",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "description",
    text: "Describe your event for attendees",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "startDateTime",
    text: "When does it start? (e.g. 15 Mar 2025, 2pm)",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "venueName",
    text: "Where is it held? (venue name)",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "address",
    text: "Street address (if different from postcode)",
    type: "text",
    options: [],
  },
  {
    id: "postCode",
    text: "Postcode",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "bookingUrl",
    text: "Booking or sign-up link (optional)",
    type: "text",
    options: [],
  },
  {
    id: "accessibility",
    text: "Is the venue wheelchair accessible?",
    type: "single-select",
    options: [
      { id: "Yes", label: "Yes" },
      { id: "No", label: "No" },
      { id: "Preferable", label: "Partially accessible" },
      { id: "Not specified", label: "Not specified" },
    ],
  },
  {
    id: "costType",
    text: "What does it cost to attend?",
    type: "single-select",
    options: [
      { id: "Free events only", label: "Free events only" },
      { id: "Up to £5", label: "Up to £5" },
      { id: "Up to £10", label: "Up to £10" },
      { id: "Up to £20", label: "Up to £20" },
      { id: "Any Price", label: "Various / pay what you can" },
    ],
  },
  {
    id: "primaryCategory",
    text: "What type of event is it?",
    type: "single-select",
    options: [
      { id: "Coffee Mornings / Social Chats", label: "Coffee Mornings / Social Chats" },
      { id: "Live music / Gigs", label: "Live music / Gigs" },
      { id: "Fitness / Exercise", label: "Fitness / Exercise" },
      { id: "Walking groups", label: "Walking groups" },
      { id: "Arts and Crafts", label: "Arts and Crafts" },
      { id: "Talks / Lectures", label: "Talks / Lectures" },
      { id: "Technology Help", label: "Technology Help" },
      { id: "Gardening / Nature", label: "Gardening / Nature" },
      { id: "Games / Quizzes", label: "Games / Quizzes" },
      { id: "Craft Workshops", label: "Craft Workshops" },
      { id: "History Talks", label: "History Talks" },
      { id: "Creative Workshops", label: "Creative Workshops" },
    ],
  },
  {
    id: "musicType",
    text: "Music style (if it's a music event)",
    type: "single-select",
    options: [
      { id: "Acoustic / Folk", label: "Acoustic / Folk" },
      { id: "Jazz / Blues", label: "Jazz / Blues" },
      { id: "Choir / Singing groups", label: "Choir / Singing groups" },
      { id: "Classical", label: "Classical" },
      { id: "Open Mic", label: "Open Mic" },
      { id: "Tribute / Nostalgia", label: "Tribute / Nostalgia" },
      { id: "Quiet seated performances", label: "Quiet seated performances" },
      { id: "Lively gigs", label: "Lively gigs" },
      { id: "Not applicable", label: "Not applicable" },
    ],
  },
  {
    id: "creativeType",
    text: "Creative focus (if it's a creative event)",
    type: "single-select",
    options: [
      { id: "Painting", label: "Painting" },
      { id: "Drawing", label: "Drawing" },
      { id: "Photography", label: "Photography" },
      { id: "Writing", label: "Writing" },
      { id: "Knitting / Crochet", label: "Knitting / Crochet" },
      { id: "Craft Workshops", label: "Craft Workshops" },
      { id: "Theatre / Performance", label: "Theatre / Performance" },
      { id: "Not applicable", label: "Not applicable" },
    ],
  },
  {
    id: "learningType",
    text: "Learning focus (if it's a learning event)",
    type: "single-select",
    options: [
      { id: "Technology Help", label: "Technology Help" },
      { id: "Language Learning", label: "Language Learning" },
      { id: "History Talks", label: "History Talks" },
      { id: "Personal Development", label: "Personal Development" },
      { id: "Creative Workshops", label: "Creative Workshops" },
      { id: "Money / Practical Life Skills", label: "Money / Practical Life Skills" },
      { id: "Business / Entrepreneurship", label: "Business / Entrepreneurship" },
      { id: "Health and wellbeing talks", label: "Health and wellbeing talks" },
      { id: "Not applicable", label: "Not applicable" },
    ],
  },
  {
    id: "socialLevel",
    text: "How social is it?",
    type: "single-select",
    options: [
      { id: "Mostly independent / low interaction", label: "Mostly independent / low interaction" },
      { id: "Small friendly group", label: "Small friendly group" },
      { id: "Moderately social", label: "Moderately social" },
      { id: "Very social / lots of interaction", label: "Very social / lots of interaction" },
    ],
  },
  {
    id: "eventFormat",
    text: "How is the event run?",
    type: "single-select",
    options: [
      { id: "Workshop", label: "Workshop" },
      { id: "Informal drop-in", label: "Informal drop-in" },
      { id: "Class", label: "Class" },
      { id: "Talk", label: "Talk" },
      { id: "Performance", label: "Performance" },
    ],
  },
  {
    id: "meetingPeople",
    text: "How much is it about meeting new people?",
    type: "single-select",
    options: [
      { id: "High", label: "Very much so" },
      { id: "Medium", label: "Somewhat" },
      { id: "Low", label: "Not really" },
    ],
  },
  {
    id: "eventTime",
    text: "When does it typically run?",
    type: "single-select",
    options: [
      { id: "Weekday mornings", label: "Weekday mornings" },
      { id: "Weekday afternoons", label: "Weekday afternoons" },
      { id: "Weekday evenings", label: "Weekday evenings" },
      { id: "Weekend mornings", label: "Weekend mornings" },
      { id: "Weekend afternoons", label: "Weekend afternoons" },
      { id: "Weekend evenings", label: "Weekend evenings" },
    ],
  },
  {
    id: "durationBand",
    text: "How long does it last?",
    type: "single-select",
    options: [
      { id: "1-2 hours", label: "1-2 hours" },
      { id: "2-3 hours", label: "2-3 hours" },
      { id: "Half Day", label: "Half Day" },
      { id: "Any Length", label: "Any Length" },
    ],
  },
  {
    id: "transport",
    text: "How do people usually get there?",
    type: "single-select",
    options: [
      { id: "Walking", label: "Walking" },
      { id: "Bus/Public transport", label: "Bus/Public transport" },
      { id: "Car", label: "Car" },
      { id: "Cycling", label: "Cycling" },
      { id: "Mixed", label: "Mixed" },
    ],
  },
  {
    id: "stepFree",
    text: "Is there step-free access?",
    type: "single-select",
    options: [
      { id: "Yes", label: "Yes" },
      { id: "No", label: "No" },
      { id: "Preferable", label: "Partially accessible" },
    ],
  },
  {
    id: "noise",
    text: "What's the noise level like?",
    type: "single-select",
    options: [
      { id: "Quiet", label: "Quiet" },
      { id: "Moderate", label: "Moderate" },
      { id: "Lively", label: "Lively" },
    ],
  },
  {
    id: "seating",
    text: "Is seating available?",
    type: "single-select",
    options: [
      { id: "Yes, essential", label: "Yes, essential" },
      { id: "Preferable", label: "Preferred but not essential" },
      { id: "No", label: "No" },
    ],
  },
  {
    id: "priceBand",
    text: "Price range",
    type: "single-select",
    options: [
      { id: "Free events only", label: "Free events only" },
      { id: "Up to £5", label: "Up to £5" },
      { id: "Up to £10", label: "Up to £10" },
      { id: "Up to £20", label: "Up to £20" },
      { id: "Any Price", label: "Various / pay what you can" },
    ],
  },
  {
    id: "primaryBenefit",
    text: "What's the main benefit for attendees?",
    type: "single-select",
    options: [
      { id: "Meet new people", label: "Meet new people" },
      { id: "Learn something new", label: "Learn something new" },
      { id: "Improve fitness", label: "Improve fitness" },
      { id: "Improve wellbeing", label: "Improve wellbeing" },
      { id: "Enjoy music / culture", label: "Enjoy music / culture" },
      { id: "Feel part of the community", label: "Feel part of the community" },
    ],
  },
  {
    id: "eventMood",
    text: "What's the vibe?",
    type: "single-select",
    options: [
      { id: "Calm and relaxed", label: "Calm and relaxed" },
      { id: "Friendly and chatty", label: "Friendly and chatty" },
      { id: "Fun and energetic", label: "Fun and energetic" },
      { id: "Creative and inspiring", label: "Creative and inspiring" },
      { id: "Educational and focused", label: "Educational and focused" },
    ],
  },
  {
    id: "lgbtqFocus",
    text: "Is it LGBTQ+ focused?",
    type: "single-select",
    options: [
      { id: "Yes", label: "Yes" },
      { id: "No", label: "No" },
      { id: "Not specified", label: "Not specified" },
    ],
  },
];
