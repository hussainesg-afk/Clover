/**
 * Seed script: inserts 30 diverse voice posts into InstantDB.
 * Run: npx tsx scripts/seed-voice-posts.ts
 * Requires: .env.local with NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_APP_ADMIN_TOKEN
 */

import { init, id } from "@instantdb/admin";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN!;

if (!appId || !adminToken) {
  console.error("Missing NEXT_PUBLIC_INSTANT_APP_ID or INSTANT_APP_ADMIN_TOKEN in .env.local");
  process.exit(1);
}

const db = init({ appId, adminToken });

const VOICE_POSTS = [
  { body: "Anyone keen for a morning yoga session in Bedminster? I'd love a gentle flow class to start the week.", category: "events", postCode: "BS3 1AB", socialLevel: "moderate", preferredTime: "Weekday mornings", groupSize: "10-20" },
  { body: "Hi guys, anyone keen for speed chess? Would be great to have a weekly thing at a local cafe.", category: "events", postCode: "BS3 4AQ", socialLevel: "high", preferredTime: "Weekday evenings", groupSize: "5-10" },
  { body: "Who wants to play tennis today? Looking for anyone near Southville who fancies a hit.", category: "sports", postCode: "BS3 1BN", socialLevel: "moderate", preferredTime: "Weekend mornings", groupSize: "1-5" },
  { body: "Would love a community pub quiz night somewhere in BS3. Midweek would be perfect!", category: "events", postCode: "BS3 1JH", socialLevel: "high", preferredTime: "Weekday evenings", groupSize: "20+" },
  { body: "Anyone interested in a book club? Thinking monthly meetups, literary fiction focus.", category: "meet-up", postCode: "BS3 3BY", socialLevel: "moderate", preferredTime: "Weekday evenings", groupSize: "5-10" },
  { body: "I want to do a walking group near Stokes Croft. Weekend mornings, easy pace, everyone welcome.", category: "events", postCode: "BS2 8QJ", socialLevel: "high", preferredTime: "Weekend mornings", groupSize: "10-20" },
  { body: "Any parents fancy a toddler music group? My little one loves singing and percussion.", category: "music", postCode: "BS3 2AA", socialLevel: "high", preferredTime: "Weekday mornings", groupSize: "10-20" },
  { body: "Looking for a life drawing class in the Bedminster area. Evenings preferred.", category: "events", postCode: "BS3 4DJ", socialLevel: "low", preferredTime: "Weekday evenings", groupSize: "5-10" },
  { body: "Anyone want to start a 5-a-side football group? Wednesday evenings ideally.", category: "sports", postCode: "BS3 1RB", socialLevel: "high", preferredTime: "Weekday evenings", groupSize: "10-20" },
  { body: "Would anyone come to a pottery and wine evening? Bring your own bottle, learn to throw on the wheel.", category: "events", postCode: "BS3 1JG", socialLevel: "moderate", preferredTime: "Weekend evenings", groupSize: "10-20" },
  { body: "Keen to find a Spanish conversation group. Intermediate level, relaxed and social.", category: "meet-up", postCode: "BS3 4AQ", socialLevel: "moderate", preferredTime: "Weekday evenings", groupSize: "5-10" },
  { body: "Anyone interested in taking a World War II history class? Would love guided talks.", category: "events", postCode: "BS3 3BY", socialLevel: "low", preferredTime: "Weekday afternoons", groupSize: "10-20" },
  { body: "Is there a knitting circle in BS3? If not, who'd want to start one?", category: "meet-up", postCode: "BS3 2DN", socialLevel: "moderate", preferredTime: "Weekday afternoons", groupSize: "5-10" },
  { body: "Would love a beginner running club. Couch to 5K style, no pressure, Ashton Court maybe?", category: "sports", postCode: "BS3 2HG", socialLevel: "moderate", preferredTime: "Weekend mornings", groupSize: "10-20" },
  { body: "Anyone want to play padel? Just picked it up and looking for regular partners.", category: "sports", postCode: "BS3 1AB", socialLevel: "moderate", preferredTime: "Weekend afternoons", groupSize: "1-5" },
  { body: "Thinking about a coding meetup for beginners. Python or web dev. Anyone interested?", category: "meet-up", postCode: "BS3 4EE", socialLevel: "moderate", preferredTime: "Weekday evenings", groupSize: "5-10" },
  { body: "Would anyone be up for open mic nights? Acoustic, poetry, comedy -- anything goes.", category: "music", postCode: "BS3 1JH", socialLevel: "high", preferredTime: "Weekend evenings", groupSize: "20+" },
  { body: "Looking for a meditation or mindfulness group. Weekly drop-in style would be ideal.", category: "solo", postCode: "BS3 3BY", socialLevel: "low", preferredTime: "Weekday mornings", groupSize: "5-10" },
  { body: "Any photographers want to do monthly photo walks around Bristol? All levels welcome.", category: "meet-up", postCode: "BS1 4SB", socialLevel: "moderate", preferredTime: "Weekend afternoons", groupSize: "5-10" },
  { body: "Would love a board games night at a local pub. Settlers of Catan anyone?", category: "events", postCode: "BS3 1JG", socialLevel: "high", preferredTime: "Weekday evenings", groupSize: "10-20" },
  { body: "Anyone else want a community gardening group? I've got allotment space to share.", category: "events", postCode: "BS3 5LT", socialLevel: "moderate", preferredTime: "Weekend mornings", groupSize: "5-10" },
  { body: "Tech help sessions for older residents? My nan needs help with her iPad.", category: "events", postCode: "BS3 2DN", socialLevel: "moderate", preferredTime: "Weekday mornings", groupSize: "5-10" },
  { body: "Would a singles mingling night work in BS3? Structured icebreakers, no awkwardness. 25-45 age range.", category: "meet-up", postCode: "BS3 1JH", socialLevel: "high", preferredTime: "Weekend evenings", groupSize: "20+" },
  { body: "Any interest in a Saturday morning swim club? Hengrove pool, nice and casual.", category: "sports", postCode: "BS14 0DE", socialLevel: "moderate", preferredTime: "Weekend mornings", groupSize: "10-20" },
  { body: "Would love live jazz evenings in Bedminster. Even just once a month would be brilliant.", category: "music", postCode: "BS3 4AQ", socialLevel: "moderate", preferredTime: "Weekend evenings", groupSize: "20+" },
  { body: "Anyone keen on a foraging walk? Know a great guide who does wild food tours near Leigh Woods.", category: "events", postCode: "BS8 3PG", socialLevel: "moderate", preferredTime: "Weekend mornings", groupSize: "10-20" },
  { body: "Dog walking group in Victoria Park? My cockapoo needs friends (and so do I!).", category: "meet-up", postCode: "BS3 4RD", socialLevel: "high", preferredTime: "Weekday mornings", groupSize: "5-10" },
  { body: "Pilates class please! Somewhere in Southville, mornings. Happy to pay up to a tenner.", category: "events", postCode: "BS3 1BN", socialLevel: "moderate", preferredTime: "Weekday mornings", groupSize: "10-20" },
  { body: "Who else wants a supper club? Different cuisine each month, BYOB, communal tables.", category: "events", postCode: "BS3 1JG", socialLevel: "high", preferredTime: "Weekend evenings", groupSize: "10-20" },
  { body: "Any dads fancy a weekend brunch meetup with the kids? Somewhere with a play area ideally.", category: "meet-up", postCode: "BS3 2AA", socialLevel: "high", preferredTime: "Weekend mornings", groupSize: "5-10" },
];

async function seed() {
  console.log(`Seeding ${VOICE_POSTS.length} voice posts...`);

  const now = Date.now();

  for (let i = 0; i < VOICE_POSTS.length; i++) {
    const post = VOICE_POSTS[i];
    const postId = id();
    const createdAt = now - (i * 2 * 60 * 60 * 1000); // stagger by 2 hours each

    await db.transact([
      db.tx.voice_posts[postId].update({
        body: post.body,
        createdAt,
        category: post.category,
        postCode: post.postCode,
        socialLevel: post.socialLevel,
        preferredTime: post.preferredTime,
        groupSize: post.groupSize,
      }),
    ]);

    console.log(`  [${i + 1}/${VOICE_POSTS.length}] ${post.body.slice(0, 60)}...`);
  }

  console.log("Done! All voice posts seeded.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
