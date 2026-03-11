// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  events: {
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
} satisfies InstantRules;

export default rules;
