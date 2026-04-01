// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  events: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id != null && (data.organizerId == null || data.organizerId == auth.id)",
      delete: "auth.id != null && (data.organizerId == null || data.organizerId == auth.id)",
      link: {
        likedBy: "auth.id != null && auth.id == linkedData.id",
      },
      unlink: {
        likedBy: "auth.id != null && auth.id == linkedData.id",
      },
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
      link: {
        upvotedBy: "auth.id != null && auth.id == linkedData.id",
        comments: "auth.id != null",
      },
      unlink: {
        upvotedBy: "auth.id != null && auth.id == linkedData.id",
        comments: "auth.id == data.ref('comments.author.id')",
      },
    },
  },
  voice_post_comments: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.ref('author.id')",
      delete: "auth.id == data.ref('author.id')",
      link: {
        author: "auth.id != null && linkedData.id == auth.id",
        post: "auth.id != null",
      },
      unlink: {
        author: "auth.id == data.ref('author.id')",
        post: "auth.id == data.ref('author.id')",
      },
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
  friend_requests: {
    allow: {
      view: "auth.id == data.fromId || auth.id == data.toId",
      create: "auth.id == data.fromId",
      update: "auth.id == data.toId || auth.id == data.fromId",
      delete: "auth.id == data.fromId || auth.id == data.toId",
    },
  },
  group_memberships: {
    allow: {
      view: "auth.id != null",
      create: "auth.id == data.userId",
      update: "auth.id == data.userId",
      delete: "auth.id == data.userId",
    },
  },
  user_locations: {
    allow: {
      view: "auth.id != null",
      create: "auth.id == data.userId",
      update: "auth.id == data.userId",
      delete: "auth.id == data.userId",
    },
  },
  conversations: {
    allow: {
      view: "auth.id == data.participant1Id || auth.id == data.participant2Id",
      create: "auth.id != null && (auth.id == data.participant1Id || auth.id == data.participant2Id)",
      update: "auth.id == data.participant1Id || auth.id == data.participant2Id",
      delete: "auth.id == data.participant1Id || auth.id == data.participant2Id",
    },
    fields: {
      participant1LastReadAt: "auth.id == data.participant1Id",
      participant2LastReadAt: "auth.id == data.participant2Id",
    },
  },
  quiet_slots: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id != null && data.hostId == auth.id",
      delete: "auth.id != null && data.hostId == auth.id",
    },
  },
  messages: {
    allow: {
      view:
        "auth.id in data.ref('conversation.participant1Id') || auth.id in data.ref('conversation.participant2Id')",
      create: "auth.id == data.senderId",
      update: "auth.id == data.senderId",
      delete: "auth.id == data.senderId",
      link: {
        conversation: "auth.id == data.senderId",
        sender: "auth.id == data.senderId",
      },
    },
  },
  event_bookings: {
    allow: {
      view: "auth.id == data.userId",
      create: "auth.id == data.userId",
      update: "auth.id == data.userId",
      delete: "auth.id == data.userId",
    },
  },
  daily_prompt_responses: {
    allow: {
      view: "auth.id != null && auth.id == data.userId",
      create: "auth.id != null && auth.id == data.userId",
      update: "auth.id != null && auth.id == data.userId",
      delete: "auth.id != null && auth.id == data.userId",
    },
  },
  health_daily_summaries: {
    allow: {
      view: "auth.id != null && auth.id == data.userId",
      create: "auth.id != null && auth.id == data.userId",
      update: "auth.id != null && auth.id == data.userId",
      delete: "auth.id != null && auth.id == data.userId",
    },
  },
} satisfies InstantRules;

export default rules;
