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
    text: "Event title",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "description",
    text: "Event description",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "startDateTime",
    text: "Start date and time (e.g. 15 Mar 2025, 2pm or 2025-03-15 14:00)",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "venueName",
    text: "Venue name",
    type: "text",
    options: [],
    required: true,
  },
  {
    id: "address",
    text: "Full address",
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
    text: "Booking URL (optional)",
    type: "text",
    options: [],
  },
  {
    id: "accessibility",
    text: "Accessibility information",
    type: "single-select",
    options: [
      { id: "Yes", label: "Yes" },
      { id: "No", label: "No" },
      { id: "Preferable", label: "Preferable" },
      { id: "Not specified", label: "Not specified" },
    ],
  },
  {
    id: "costType",
    text: "Cost type",
    type: "single-select",
    options: [
      { id: "Free events only", label: "Free events only" },
      { id: "Up to £5", label: "Up to £5" },
      { id: "Up to £10", label: "Up to £10" },
      { id: "Up to £20", label: "Up to £20" },
      { id: "Any Price", label: "Any Price" },
    ],
  },
  {
    id: "primaryCategory",
    text: "Primary category",
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
    text: "Music type (if applicable)",
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
    text: "Creative type (if applicable)",
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
    text: "Learning type (if applicable)",
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
    text: "Social level",
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
    text: "Event format",
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
    text: "Meeting people focus",
    type: "single-select",
    options: [
      { id: "High", label: "High" },
      { id: "Medium", label: "Medium" },
      { id: "Low", label: "Low" },
    ],
  },
  {
    id: "eventTime",
    text: "Event time",
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
    text: "Duration",
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
    text: "Transport options",
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
    text: "Step-free access",
    type: "single-select",
    options: [
      { id: "Yes", label: "Yes" },
      { id: "No", label: "No" },
      { id: "Preferable", label: "Preferable" },
    ],
  },
  {
    id: "noise",
    text: "Noise level",
    type: "single-select",
    options: [
      { id: "Quiet", label: "Quiet" },
      { id: "Moderate", label: "Moderate" },
      { id: "Lively", label: "Lively" },
    ],
  },
  {
    id: "seating",
    text: "Seating available",
    type: "single-select",
    options: [
      { id: "Yes, essential", label: "Yes, essential" },
      { id: "Preferable", label: "Preferable" },
      { id: "No", label: "No" },
    ],
  },
  {
    id: "priceBand",
    text: "Price band",
    type: "single-select",
    options: [
      { id: "Free events only", label: "Free events only" },
      { id: "Up to £5", label: "Up to £5" },
      { id: "Up to £10", label: "Up to £10" },
      { id: "Up to £20", label: "Up to £20" },
      { id: "Any Price", label: "Any Price" },
    ],
  },
  {
    id: "primaryBenefit",
    text: "Primary benefit",
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
    text: "Event mood",
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
    text: "LGBTQ+ focus",
    type: "single-select",
    options: [
      { id: "Yes", label: "Yes" },
      { id: "No", label: "No" },
      { id: "Not specified", label: "Not specified" },
    ],
  },
];
