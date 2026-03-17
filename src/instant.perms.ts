// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  events: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id != null && (data.organizerId == null || data.organizerId == auth.id)",
      delete: "auth.id != null && (data.organizerId == null || data.organizerId == auth.id)",
    },
  },
  solo_events: {
    allow: {
      view: "true",
    },
  },
  questionnaire_responses: {
    allow: {
      view: "auth.id != null && auth.id == data.userId",
      create: "auth.id != null && auth.id == data.userId",
      update: "auth.id != null && auth.id == data.userId",
      delete: "auth.id != null && auth.id == data.userId",
    },
  },
  user_settings: {
    allow: {
      view: "auth.id != null && auth.id == data.userId",
      create: "auth.id != null && auth.id == data.userId",
      update: "auth.id != null && auth.id == data.userId",
      delete: "auth.id != null && auth.id == data.userId",
    },
  },
  voice_posts: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.ref('author.id')",
      delete: "auth.id == data.ref('author.id')",
    },
  },
  $users: {
    allow: {
      view: "auth.id != null",
    },
    fields: {
      email: "auth.id == data.id",
    },
  },
} satisfies InstantRules;

export default rules;
