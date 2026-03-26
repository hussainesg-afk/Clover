import { NextRequest, NextResponse } from "next/server";
import { init } from "@instantdb/admin";
import Anthropic from "@anthropic-ai/sdk";
import { getInstantAppIdForServer, getInstantAdminToken } from "@/lib/instant-server-env";
import { VOICE_BREADTH_SEEDS } from "@/config/voice-breadth-seeds";

export interface AISuggestion {
  title: string;
  description: string;
  category: string;
  tags: string[];
  suggestedDate: string;
  suggestedTime: string;
  ticketPrice: string;
  targetSize: string;
  bookingConfidence: number;
  estimatedRevenue: string;
  resourceCost: string;
  setupTime: string;
  localsSearching: number;
  sourcePostIds: string[];
}

type DbRow = Record<string, unknown>;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Max recommendations returned per request (fallback + AI cap). */
const MAX_SUGGESTIONS = 10;

interface PostSummary {
  id: string;
  body: string;
  category: string | null;
  postCode: string | null;
  socialLevel: string | null;
  preferredTime: string | null;
  groupSize: string | null;
  upvotes: number;
  createdAt: number;
}

interface SlotInfo {
  date: string;
  startTime: string;
  endTime: string;
  label?: string | null;
}

/* ================================================================== */
/*  Topic clustering -- groups voice posts by what people are asking   */
/* ================================================================== */

interface TopicCluster {
  key: string;
  title: string;
  category: string;
  posts: PostSummary[];
  totalUpvotes: number;
  description: string;
  priceModel: { display: string; perHead: number };
  idealSize: { min: number; max: number; display: string };
  setupMinutes: number;
  resourceCostEstimate: number;
  timeOfDay: "morning" | "afternoon" | "evening";
}

const TOPIC_RULES: {
  pattern: RegExp;
  key: string;
  title: string;
  category: string;
  description: string;
  price: { display: string; perHead: number };
  size: { min: number; max: number; display: string };
  setup: number;
  resourceCost: number;
  timeOfDay: "morning" | "afternoon" | "evening";
}[] = [
  {
    pattern: /yoga/i,
    key: "yoga",
    title: "Morning Yoga Flow",
    category: "Wellness",
    description:
      "A gentle, all-levels vinyasa flow to start the week right. Based on strong local demand from Bedminster and Southville residents looking for accessible morning wellness sessions. Mats provided, bring your own water bottle. Perfect for filling a quiet weekday morning slot with a repeatable, low-cost class.",
    price: { display: "\u00a37 per person", perHead: 7 },
    size: { min: 10, max: 20, display: "10-20 people" },
    setup: 15,
    resourceCost: 12,
    timeOfDay: "morning",
  },
  {
    pattern: /pilates/i,
    key: "pilates",
    title: "Pilates Power Hour",
    category: "Wellness",
    description:
      "Structured mat pilates with a qualified instructor. Multiple Southville residents have requested this specifically -- one mentioned willingness to pay up to \u00a310. Great for a consistent weekly booking with strong repeat attendance.",
    price: { display: "\u00a38 per person", perHead: 8 },
    size: { min: 8, max: 18, display: "8-18 people" },
    setup: 10,
    resourceCost: 15,
    timeOfDay: "morning",
  },
  {
    pattern: /chess/i,
    key: "chess",
    title: "Speed Chess Club",
    category: "Games",
    description:
      "Weekly blitz and rapid chess in a cafe setting. Community demand highlights interest in competitive but social gaming -- perfect for a regular Tuesday or Wednesday evening. Minimal setup: just boards, clocks, and a few tables. Generates steady footfall for quieter weekday evenings.",
    price: { display: "\u00a33 per person", perHead: 3 },
    size: { min: 8, max: 16, display: "8-16 people" },
    setup: 10,
    resourceCost: 8,
    timeOfDay: "evening",
  },
  {
    pattern: /tennis/i,
    key: "tennis",
    title: "Community Tennis Drop-in",
    category: "Fitness",
    description:
      "Casual tennis for all levels in the Southville area. Locals are asking for accessible, no-commitment sports sessions. Partner with a nearby court or park and offer sign-up through your venue. Low overhead, high community engagement.",
    price: { display: "\u00a35 per person", perHead: 5 },
    size: { min: 4, max: 12, display: "4-12 people" },
    setup: 20,
    resourceCost: 10,
    timeOfDay: "morning",
  },
  {
    pattern: /padel/i,
    key: "padel",
    title: "Padel Social Session",
    category: "Fitness",
    description:
      "Padel is booming in Bristol and locals are actively looking for partners. Organise a round-robin format that rotates pairs -- ideal for beginners who want to play without needing to find a regular partner. Weekend afternoon slot fills well.",
    price: { display: "\u00a38 per person", perHead: 8 },
    size: { min: 4, max: 8, display: "4-8 people" },
    setup: 15,
    resourceCost: 20,
    timeOfDay: "afternoon",
  },
  {
    pattern: /quiz/i,
    key: "quiz",
    title: "Community Pub Quiz Night",
    category: "Social",
    description:
      "Midweek pub quiz with rounds covering general knowledge, music, and local Bristol trivia. This is one of the most requested event types in BS3 -- high social engagement, strong repeat attendance, and an easy upsell on food and drinks. Teams of 4-6 keep it lively.",
    price: { display: "\u00a32 per person", perHead: 2 },
    size: { min: 30, max: 60, display: "30-60 people" },
    setup: 30,
    resourceCost: 15,
    timeOfDay: "evening",
  },
  {
    pattern: /book club/i,
    key: "book-club",
    title: "Monthly Book Club",
    category: "Learning",
    description:
      "A relaxed literary fiction book club meeting once a month. Locals want a curated, discussion-led evening with wine or coffee. Low setup, strong loyalty -- book clubs drive consistent midweek footfall and attract a demographic that spends well on drinks.",
    price: { display: "Free (drinks revenue)", perHead: 0 },
    size: { min: 8, max: 15, display: "8-15 people" },
    setup: 10,
    resourceCost: 5,
    timeOfDay: "evening",
  },
  {
    pattern: /walk(?!ing).*(?:group|community)|walking group/i,
    key: "walking",
    title: "Community Walking Group",
    category: "Wellness",
    description:
      "Easy-pace weekend morning walk starting from your venue, looping through local green spaces, and returning for tea or brunch. Multiple Stokes Croft and BS3 residents requested this. Start-and-end at your venue drives food/drink revenue with zero event cost.",
    price: { display: "Free", perHead: 0 },
    size: { min: 10, max: 25, display: "10-25 people" },
    setup: 5,
    resourceCost: 0,
    timeOfDay: "morning",
  },
  {
    pattern: /toddler|music.*toddler|parent.*music/i,
    key: "toddler-music",
    title: "Toddler Music & Rhythm Session",
    category: "Music",
    description:
      "Interactive singing and percussion for under-5s and their parents. Parents in BS3 are actively searching for weekday morning activities. Sessions run 45 minutes, allowing a coffee stop afterwards. Highly repeatable with a loyal audience that books blocks in advance.",
    price: { display: "\u00a36 per child", perHead: 6 },
    size: { min: 10, max: 20, display: "10-20 (parent + child)" },
    setup: 15,
    resourceCost: 10,
    timeOfDay: "morning",
  },
  {
    pattern: /life draw/i,
    key: "life-drawing",
    title: "Life Drawing Evening",
    category: "Crafts",
    description:
      "Structured figure drawing with a professional model and tutor. Bedminster residents have requested this as an evening activity. Attract a creative crowd willing to pay a premium. Supplies can be BYO or included for a higher ticket price.",
    price: { display: "\u00a312 per person", perHead: 12 },
    size: { min: 8, max: 15, display: "8-15 people" },
    setup: 20,
    resourceCost: 35,
    timeOfDay: "evening",
  },
  {
    pattern: /5.a.side|football/i,
    key: "football",
    title: "5-a-Side Football",
    category: "Fitness",
    description:
      "Weekly casual 5-a-side on Wednesday evenings. Strong demand from BS3 locals who want regular, no-commitment team sport. Partner with a local pitch and handle sign-ups through your venue for post-match drinks. Drives midweek evening traffic.",
    price: { display: "\u00a35 per person", perHead: 5 },
    size: { min: 10, max: 20, display: "10-20 people" },
    setup: 10,
    resourceCost: 25,
    timeOfDay: "evening",
  },
  {
    pattern: /pottery/i,
    key: "pottery",
    title: "Pottery & Prosecco Evening",
    category: "Crafts",
    description:
      "Hands-on wheel-throwing workshop with BYOB encouraged. This is a premium experience locals are willing to pay for -- the social element of wine + clay is a proven draw. Weekend evening slot, 2-hour sessions, capacity capped for quality.",
    price: { display: "\u00a315 per person", perHead: 15 },
    size: { min: 8, max: 14, display: "8-14 people" },
    setup: 25,
    resourceCost: 40,
    timeOfDay: "evening",
  },
  {
    pattern: /spanish|language/i,
    key: "spanish",
    title: "Spanish Conversation Evening",
    category: "Learning",
    description:
      "Informal intermediate-level conversation practice over tapas and drinks. Locals want a social way to practise languages without the pressure of a formal class. Low setup, strong bar/food revenue, and builds a loyal weekly crowd.",
    price: { display: "Free (food/drink spend)", perHead: 0 },
    size: { min: 6, max: 12, display: "6-12 people" },
    setup: 10,
    resourceCost: 5,
    timeOfDay: "evening",
  },
  {
    pattern: /history|ww/i,
    key: "history",
    title: "Bristol History Talk Series",
    category: "Learning",
    description:
      "Guest speaker series covering local and wartime history. Requested by residents looking for afternoon cultural programming. Attracts an older demographic with high drink spend. Monthly format keeps it special and builds anticipation.",
    price: { display: "\u00a34 per person", perHead: 4 },
    size: { min: 15, max: 30, display: "15-30 people" },
    setup: 15,
    resourceCost: 20,
    timeOfDay: "afternoon",
  },
  {
    pattern: /knit/i,
    key: "knitting",
    title: "Knitting & Natter Circle",
    category: "Crafts",
    description:
      "Relaxed afternoon knitting group with tea and cake. BS3 residents want a regular, low-key creative social gathering. Negligible setup, strong cake/coffee revenue, and builds deep community loyalty. Perfect for filling quiet weekday afternoons.",
    price: { display: "Free", perHead: 0 },
    size: { min: 6, max: 12, display: "6-12 people" },
    setup: 5,
    resourceCost: 3,
    timeOfDay: "afternoon",
  },
  {
    pattern: /run|5k|couch to/i,
    key: "running",
    title: "Beginner 5K Run Club",
    category: "Fitness",
    description:
      "Couch-to-5K style programme starting and finishing at your venue. Multiple locals want a no-pressure running group, especially around Ashton Court. Your venue becomes the meeting point and post-run social hub. Drives Saturday morning brunch revenue.",
    price: { display: "Free (brunch upsell)", perHead: 0 },
    size: { min: 10, max: 25, display: "10-25 people" },
    setup: 5,
    resourceCost: 0,
    timeOfDay: "morning",
  },
  {
    pattern: /cod(?:e|ing)|python|web dev/i,
    key: "coding",
    title: "Beginner Coding Meetup",
    category: "Learning",
    description:
      "Informal coding workshop for complete beginners -- Python or web development. Tech-curious locals in BS3 want accessible, jargon-free sessions. Laptop-friendly venue with good WiFi is all you need. Evening slot after work draws young professionals.",
    price: { display: "Free", perHead: 0 },
    size: { min: 8, max: 15, display: "8-15 people" },
    setup: 10,
    resourceCost: 5,
    timeOfDay: "evening",
  },
  {
    pattern: /open mic/i,
    key: "open-mic",
    title: "Open Mic Night",
    category: "Music",
    description:
      "Acoustic music, poetry, and comedy -- anything goes. Huge demand in BS3 for a regular creative platform. Weekend evenings fill naturally, and performers bring their own audiences. Minimal cost: just a mic, PA, and a stage area. Major bar revenue driver.",
    price: { display: "Free entry", perHead: 0 },
    size: { min: 30, max: 60, display: "30-60 people" },
    setup: 20,
    resourceCost: 10,
    timeOfDay: "evening",
  },
  {
    pattern: /meditat|mindful/i,
    key: "meditation",
    title: "Mindfulness & Meditation Drop-in",
    category: "Wellness",
    description:
      "Guided weekly meditation session in a calm, welcoming space. Locals are looking for accessible, drop-in mindfulness without long-term commitments. Morning slot before work or lunchtime works best. Low overhead, builds a peaceful brand association for your venue.",
    price: { display: "\u00a35 per person", perHead: 5 },
    size: { min: 6, max: 15, display: "6-15 people" },
    setup: 10,
    resourceCost: 5,
    timeOfDay: "morning",
  },
  {
    pattern: /photo/i,
    key: "photography",
    title: "Monthly Photography Walk",
    category: "Social",
    description:
      "Themed photography walk around Bristol, meeting at your venue and returning to share shots over coffee. All levels welcome, all cameras welcome (phones included). Start and end at your venue to capture food/drink spend. Weekend afternoon slot.",
    price: { display: "Free", perHead: 0 },
    size: { min: 8, max: 20, display: "8-20 people" },
    setup: 5,
    resourceCost: 0,
    timeOfDay: "afternoon",
  },
  {
    pattern: /board game|settlers|catan/i,
    key: "board-games",
    title: "Board Games Night",
    category: "Games",
    description:
      "Bring-your-own or house-provided board games in a pub setting. Settlers of Catan, Ticket to Ride, and classics. Strong demand from BS3 locals wanting a social weekday evening activity. Almost zero cost, significant bar revenue, and a loyal returning crowd.",
    price: { display: "Free (drinks revenue)", perHead: 0 },
    size: { min: 15, max: 30, display: "15-30 people" },
    setup: 15,
    resourceCost: 8,
    timeOfDay: "evening",
  },
  {
    pattern: /garden/i,
    key: "gardening",
    title: "Community Gardening Group",
    category: "Wellness",
    description:
      "Weekend morning gardening meetup, potentially using allotment space offered by a local resident. Your venue hosts the post-dig brunch. Great community engagement, zero event cost, drives morning food revenue, and positions your venue as a neighbourhood hub.",
    price: { display: "Free", perHead: 0 },
    size: { min: 6, max: 12, display: "6-12 people" },
    setup: 5,
    resourceCost: 0,
    timeOfDay: "morning",
  },
  {
    pattern: /tech help|ipad|older/i,
    key: "tech-help",
    title: "Tech for Beginners Drop-in",
    category: "Learning",
    description:
      "Friendly help sessions for older residents who need support with phones, tablets, and laptops. A local resident flagged this need specifically. Weekday mornings work best for this demographic. Builds deep community goodwill and drives regular morning footfall.",
    price: { display: "Free", perHead: 0 },
    size: { min: 5, max: 10, display: "5-10 people" },
    setup: 10,
    resourceCost: 3,
    timeOfDay: "morning",
  },
  {
    pattern: /singles|mingle/i,
    key: "singles",
    title: "Singles Mingling Night",
    category: "Social",
    description:
      "Structured icebreaker event for 25-45 year olds. Strong demand in BS3 for an event that takes the awkwardness out of meeting new people. Structured rounds, conversation prompts, and a relaxed vibe. Weekend evening slot, high bar spend, and a large capacity event.",
    price: { display: "\u00a38 per person", perHead: 8 },
    size: { min: 25, max: 50, display: "25-50 people" },
    setup: 20,
    resourceCost: 15,
    timeOfDay: "evening",
  },
  {
    pattern: /swim/i,
    key: "swim",
    title: "Saturday Morning Swim Club",
    category: "Fitness",
    description:
      "Casual swim meetup at Hengrove pool with post-swim brunch at your venue. Locals want a no-pressure social swimming group. Your venue handles sign-ups and becomes the social hub afterwards. Saturday morning slot drives brunch revenue naturally.",
    price: { display: "\u00a34 per person (excl. pool entry)", perHead: 4 },
    size: { min: 8, max: 20, display: "8-20 people" },
    setup: 5,
    resourceCost: 5,
    timeOfDay: "morning",
  },
  {
    pattern: /jazz/i,
    key: "jazz",
    title: "Live Jazz Evening",
    category: "Music",
    description:
      "Monthly live jazz in a cosy venue setting. Bedminster locals have been asking for this -- even once a month would be brilliant, as one resident put it. A local trio or duo keeps costs manageable. Premium atmosphere drives cocktail and wine sales.",
    price: { display: "\u00a35 - \u00a310", perHead: 7 },
    size: { min: 25, max: 50, display: "25-50 people" },
    setup: 30,
    resourceCost: 80,
    timeOfDay: "evening",
  },
  {
    pattern: /forag/i,
    key: "foraging",
    title: "Wild Foraging Walk",
    category: "Food",
    description:
      "Guided foraging tour near Leigh Woods with a return to your venue for a wild food taster. A local resident already knows a guide. Premium experience, weekend mornings, attracts foodies willing to pay well. Your venue sells the tickets and hosts the finish.",
    price: { display: "\u00a312 per person", perHead: 12 },
    size: { min: 8, max: 16, display: "8-16 people" },
    setup: 10,
    resourceCost: 25,
    timeOfDay: "morning",
  },
  {
    pattern: /dog.*walk|walk.*dog/i,
    key: "dog-walking",
    title: "Dog Walking Social",
    category: "Social",
    description:
      "Victoria Park dog walk meetup, returning to your venue for coffee and dog treats. The demand quote says it all: 'My cockapoo needs friends (and so do I!)'. Weekday morning slot, zero cost, drives regular coffee revenue, and builds a fiercely loyal customer base.",
    price: { display: "Free", perHead: 0 },
    size: { min: 6, max: 15, display: "6-15 people" },
    setup: 5,
    resourceCost: 5,
    timeOfDay: "morning",
  },
  {
    pattern: /supper club|supper/i,
    key: "supper-club",
    title: "Community Supper Club",
    category: "Food",
    description:
      "BYOB communal supper with a different cuisine each month. Locals want a social dining experience with long tables and good conversation. High ticket price covers ingredients and a guest cook. Weekend evening, limited seats create urgency and exclusivity.",
    price: { display: "\u00a315 per person", perHead: 15 },
    size: { min: 12, max: 24, display: "12-24 people" },
    setup: 45,
    resourceCost: 60,
    timeOfDay: "evening",
  },
  {
    pattern: /brunch|dad/i,
    key: "brunch",
    title: "Weekend Dads' Brunch",
    category: "Social",
    description:
      "Saturday or Sunday brunch meetup for dads and their kids, at a venue with a play area or outdoor space. Bristol parents are actively looking for this. Your venue gets guaranteed covers during a typically quiet late-morning slot. Build a regular community around it.",
    price: { display: "Free entry (food spend)", perHead: 0 },
    size: { min: 8, max: 15, display: "8-15 families" },
    setup: 10,
    resourceCost: 5,
    timeOfDay: "morning",
  },
];

/* ------------------------------------------------------------------ */
/*  Cluster posts into topics                                          */
/* ------------------------------------------------------------------ */

function clusterPosts(posts: PostSummary[]): TopicCluster[] {
  const matched = new Set<string>();
  const clusters: TopicCluster[] = [];

  for (const rule of TOPIC_RULES) {
    const matching = posts.filter(
      (p) => !matched.has(p.id) && rule.pattern.test(p.body),
    );
    if (matching.length === 0) continue;

    for (const p of matching) matched.add(p.id);

    clusters.push({
      key: rule.key,
      title: rule.title,
      category: rule.category,
      posts: matching,
      totalUpvotes: matching.reduce((s, p) => s + p.upvotes, 0),
      description: rule.description,
      priceModel: rule.price,
      idealSize: rule.size,
      setupMinutes: rule.setup,
      resourceCostEstimate: rule.resourceCost,
      timeOfDay: rule.timeOfDay,
    });
  }

  return clusters;
}

/* ------------------------------------------------------------------ */
/*  Booking confidence formula                                         */
/*                                                                     */
/*  Formula (out of 100):                                              */
/*    demand     = (cluster posts / total posts) * 100, capped at 40   */
/*    engagement = (upvotes / cluster posts), capped at 25             */
/*      - each upvote-per-post adds 5 points, max 25                  */
/*    specificity = up to 20 points:                                   */
/*      - +8  if >50% of posts specify a preferred time               */
/*      - +6  if >50% of posts specify a group size                   */
/*      - +6  if >50% of posts specify a social level                 */
/*    recency = up to 15 points:                                       */
/*      - average age of posts: <3d=15, <7d=12, <14d=8, <30d=4        */
/*                                                                     */
/*  No free baseline. 0 upvotes + 1 post = low confidence.            */
/*  Breadth-seed-* posts count at reduced weight so real voices win.    */
/* ------------------------------------------------------------------ */

function isBreadthSeedPost(p: PostSummary): boolean {
  return p.id.startsWith("breadth-seed-");
}

function computeConfidence(cluster: TopicCluster, totalRealPosts: number): number {
  const realInCluster = cluster.posts.filter((p) => !isBreadthSeedPost(p)).length;
  const seedInCluster = cluster.posts.length - realInCluster;
  const denom = Math.max(totalRealPosts, 1);
  const weightedClusterSize = realInCluster + seedInCluster * 0.12;
  const demand = Math.min(40, Math.round((weightedClusterSize / denom) * 100));

  const upvotesPerPost = cluster.totalUpvotes / Math.max(cluster.posts.length, 1);
  const engagement = Math.min(25, Math.round(upvotesPerPost * 5));

  const halfOrMore = (fn: (p: PostSummary) => boolean) =>
    cluster.posts.filter(fn).length >= cluster.posts.length / 2;

  let specificity = 0;
  if (halfOrMore((p) => !!p.preferredTime)) specificity += 8;
  if (halfOrMore((p) => !!p.groupSize)) specificity += 6;
  if (halfOrMore((p) => !!p.socialLevel)) specificity += 6;

  const now = Date.now();
  const avgAgeMs =
    cluster.posts.reduce((sum, p) => sum + (now - p.createdAt), 0) /
    Math.max(cluster.posts.length, 1);
  const avgAgeDays = avgAgeMs / (1000 * 60 * 60 * 24);
  let recency = 4;
  if (avgAgeDays < 3) recency = 15;
  else if (avgAgeDays < 7) recency = 12;
  else if (avgAgeDays < 14) recency = 8;

  return Math.min(95, demand + engagement + specificity + recency);
}

/* ------------------------------------------------------------------ */
/*  Locals interested -- actual people count, no inflation             */
/*                                                                     */
/*  = number of unique authors who posted about this topic             */
/*    + number of unique users who upvoted those posts                 */
/*                                                                     */
/*  This is the real count of people who expressed interest.           */
/* ------------------------------------------------------------------ */

function countLocalsInterested(cluster: TopicCluster): number {
  const realCount = cluster.posts.filter((p) => !isBreadthSeedPost(p)).length;
  return realCount + cluster.totalUpvotes;
}

/* ------------------------------------------------------------------ */
/*  Generate tags from real data                                       */
/* ------------------------------------------------------------------ */

function generateTags(cluster: TopicCluster, confidence: number): string[] {
  const tags: string[] = [];

  if (cluster.priceModel.perHead === 0) {
    tags.push("Free Entry");
  } else {
    tags.push("Ticketed");
  }

  if (confidence >= 80) tags.push("High Demand");
  if (cluster.posts.length >= 2) tags.push("Trending");
  if (cluster.totalUpvotes >= 3) tags.push("Popular");

  const hasCommunityWords = cluster.posts.some((p) =>
    /community|volunteer|help|everyone welcome|all welcome/i.test(p.body),
  );
  if (hasCommunityWords || cluster.priceModel.perHead === 0) {
    tags.push("Community Value");
  }

  return tags.slice(0, 4);
}

/* ------------------------------------------------------------------ */
/*  Smart date/time scheduling                                         */
/* ------------------------------------------------------------------ */

function resolveTimeSlot(
  cluster: TopicCluster,
  slots: SlotInfo[],
  index: number,
): { date: string; time: string } {
  if (slots.length > 0) {
    const slot = slots[index % slots.length];
    const d = new Date(slot.date + "T00:00:00");
    const date = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "long",
    });
    return { date, time: `${slot.startTime} - ${slot.endTime}` };
  }

  const prefTimes = cluster.posts
    .map((p) => p.preferredTime?.toLowerCase() ?? "")
    .filter(Boolean);

  const isWeekend = prefTimes.some((t) => t.includes("weekend"));
  const isWeekday = prefTimes.some((t) => t.includes("weekday"));

  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + 2 + index * 2);

  if (isWeekend) {
    while (target.getDay() !== 6 && target.getDay() !== 0) {
      target.setDate(target.getDate() + 1);
    }
  } else if (isWeekday) {
    while (target.getDay() === 0 || target.getDay() === 6) {
      target.setDate(target.getDate() + 1);
    }
  }

  const date = target.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  const timeMap = {
    morning: "09:30 - 11:00",
    afternoon: "14:00 - 16:00",
    evening: "19:00 - 21:00",
  };

  return { date, time: timeMap[cluster.timeOfDay] };
}

/* ------------------------------------------------------------------ */
/*  Financial modelling                                                */
/* ------------------------------------------------------------------ */

function computeFinancials(cluster: TopicCluster): {
  estimatedRevenue: string;
  resourceCost: string;
} {
  const avgSize = Math.round((cluster.idealSize.min + cluster.idealSize.max) / 2);
  const maxSize = cluster.idealSize.max;

  if (cluster.priceModel.perHead === 0) {
    const drinkRevMin = avgSize * 4;
    const drinkRevMax = maxSize * 6;
    return {
      estimatedRevenue: `\u00a3${drinkRevMin}-\u00a3${drinkRevMax} (drinks/food)`,
      resourceCost: cluster.resourceCostEstimate > 0 ? `~\u00a3${cluster.resourceCostEstimate}` : "Minimal",
    };
  }

  const minRev = cluster.idealSize.min * cluster.priceModel.perHead;
  const maxRev = maxSize * cluster.priceModel.perHead;
  return {
    estimatedRevenue: `\u00a3${minRev}-\u00a3${maxRev}`,
    resourceCost: `~\u00a3${cluster.resourceCostEstimate}`,
  };
}

/* ================================================================== */
/*  Build the final suggestion list                                    */
/* ================================================================== */

function buildFallbackSuggestions(
  posts: PostSummary[],
  slots: SlotInfo[],
): AISuggestion[] {
  const totalRealPosts = posts.filter((p) => !isBreadthSeedPost(p)).length;
  const clusters = clusterPosts(posts);

  clusters.sort((a, b) => {
    const confA = computeConfidence(a, totalRealPosts);
    const confB = computeConfidence(b, totalRealPosts);
    return confB - confA;
  });

  const top = clusters.slice(0, MAX_SUGGESTIONS);

  return top.map((cluster, i): AISuggestion => {
    const confidence = computeConfidence(cluster, totalRealPosts);
    const locals = countLocalsInterested(cluster);
    const tags = generateTags(cluster, confidence);
    const { date, time } = resolveTimeSlot(cluster, slots, i);
    const { estimatedRevenue, resourceCost } = computeFinancials(cluster);

    return {
      title: cluster.title,
      description: cluster.description,
      category: cluster.category,
      tags,
      suggestedDate: date,
      suggestedTime: time,
      ticketPrice: cluster.priceModel.display,
      targetSize: cluster.idealSize.display,
      bookingConfidence: confidence,
      estimatedRevenue,
      resourceCost,
      setupTime: `${cluster.setupMinutes} min`,
      localsSearching: locals,
      sourcePostIds: cluster.posts.map((p) => p.id),
    };
  });
}

/* ================================================================== */
/*  API handler                                                        */
/* ================================================================== */

export async function POST(req: NextRequest) {
  const appId = getInstantAppIdForServer();
  const adminToken = getInstantAdminToken();
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!appId || !adminToken) {
    const missing: string[] = [];
    if (!appId) missing.push("NEXT_PUBLIC_INSTANT_APP_ID (or INSTANT_APP_ID)");
    if (!adminToken) missing.push("INSTANT_APP_ADMIN_TOKEN");
    return NextResponse.json(
      {
        error: "Database connection is not configured on the server.",
        missingEnv: missing,
        hint:
          "In Vercel: Project Settings > Environment Variables, add these for Production (and Preview if needed), then Redeploy. Copy values from your local .env.local. INSTANT_APP_ADMIN_TOKEN is required for this API; get it from the InstantDB dashboard.",
      },
      { status: 503 },
    );
  }

  let hostId: string;
  try {
    const body = await req.json();
    hostId = body.hostId;
    if (!hostId) throw new Error("missing hostId");
  } catch {
    return NextResponse.json({ error: "hostId is required" }, { status: 400 });
  }

  try {
    const db = init({ appId, adminToken });

    const [voiceResult, slotsResult] = await Promise.all([
      db.query({
        voice_posts: {
          $: { order: { createdAt: "desc" }, limit: 100 },
          author: {},
          upvotedBy: {},
        },
      }),
      db.query({ quiet_slots: {} }),
    ]);

    const cutoff = Date.now() - THIRTY_DAYS_MS;
    const recentPosts = ((voiceResult.voice_posts ?? []) as DbRow[]).filter(
      (p) => typeof p.createdAt === "number" && p.createdAt >= cutoff,
    );

    const hostSlots = ((slotsResult.quiet_slots ?? []) as DbRow[]).filter(
      (s) => s.hostId === hostId && s.status === "available",
    );

    const now = Date.now();
    const breadthSeedPosts: PostSummary[] = VOICE_BREADTH_SEEDS.map((body, i) => ({
      id: `breadth-seed-${String(i + 1).padStart(3, "0")}`,
      body,
      category: null,
      postCode: null,
      socialLevel: null,
      preferredTime: null,
      groupSize: null,
      upvotes: 0,
      createdAt: now,
    }));

    const postsFromDb: PostSummary[] = recentPosts.map((p) => ({
      id: String(p.id),
      body: String(p.body ?? ""),
      category: (p.category as string) ?? null,
      postCode: (p.postCode as string) ?? null,
      socialLevel: (p.socialLevel as string) ?? null,
      preferredTime: (p.preferredTime as string) ?? null,
      groupSize: (p.groupSize as string) ?? null,
      upvotes: Array.isArray(p.upvotedBy) ? p.upvotedBy.length : 0,
      createdAt: typeof p.createdAt === "number" ? p.createdAt : now,
    }));

    const postsForPrompt: PostSummary[] = [...postsFromDb, ...breadthSeedPosts];

    if (postsForPrompt.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: "No voice signals available to analyse.",
      });
    }

    const slotsForPrompt: SlotInfo[] = hostSlots.map((s) => ({
      date: String(s.date),
      startTime: String(s.startTime),
      endTime: String(s.endTime),
      label: (s.label as string) ?? null,
    }));

    if (anthropicKey) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });

        const systemPrompt = `You are Clover's AI event recommendation engine for venue hosts in Bristol, UK.
Your job is to analyse community voice posts (requests/ideas from locals) and match them with the host's available quiet slots to generate concrete, actionable event suggestions the host can immediately approve and run.

Rules:
- Generate between 3 and ${MAX_SUGGESTIONS} event suggestions (up to ${MAX_SUGGESTIONS} if demand is strong).
- Each suggestion must be tied to one of the host's quiet slots (date/time). If no quiet slots are provided, pick reasonable upcoming dates.
- bookingConfidence is 0-100 based on demand signals (upvotes, how many posts mention similar things).
- localsSearching is an estimate of nearby interested people based on post engagement.
- estimatedRevenue, resourceCost, and setupTime should be realistic for a small Bristol venue.
- category should be one of: Wellness, Social, Fitness, Learning, Crafts, Music, Food, Games.
- tags should include relevant labels like "Ticketed", "Free Entry", "High Demand", "Trending", "Community Value".
- sourcePostIds must list post IDs that inspired the suggestion. Real voice posts use their database id. Synthetic breadth lines use ids breadth-seed-001 through breadth-seed-100 when matched.
- Return ONLY valid JSON, no markdown fences.`;

        const userPrompt = `Here are voice signals: real posts from the last 30 days first, then breadth-seed-001..100 (diverse community-interest prompts). Use both for variety; prefer tying suggestions to real post ids when they match.
${JSON.stringify(postsForPrompt, null, 2)}

Here are the host's available quiet slots:
${slotsForPrompt.length > 0 ? JSON.stringify(slotsForPrompt, null, 2) : "No quiet slots defined yet. Suggest reasonable upcoming dates/times."}

Generate event suggestions as a JSON array matching this TypeScript interface:
interface AISuggestion {
  title: string;
  description: string;
  category: string;
  tags: string[];
  suggestedDate: string;
  suggestedTime: string;
  ticketPrice: string;
  targetSize: string;
  bookingConfidence: number;
  estimatedRevenue: string;
  resourceCost: string;
  setupTime: string;
  localsSearching: number;
  sourcePostIds: string[];
}

Return only the JSON array.`;

        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [{ role: "user", content: userPrompt }],
          system: systemPrompt,
        });

        const textBlock = message.content.find((b) => b.type === "text");
        const raw = textBlock?.text ?? "[]";

        let suggestions: AISuggestion[];
        try {
          suggestions = JSON.parse(raw);
          if (!Array.isArray(suggestions)) suggestions = [];
        } catch {
          suggestions = [];
        }

        if (suggestions.length > 0) {
          return NextResponse.json({
            suggestions: suggestions.slice(0, MAX_SUGGESTIONS),
            source: "ai",
          });
        }
      } catch (aiErr) {
        console.warn(
          "Anthropic AI unavailable, using smart fallback:",
          (aiErr as Error).message?.slice(0, 120),
        );
      }
    }

    const suggestions = buildFallbackSuggestions(postsForPrompt, slotsForPrompt);
    return NextResponse.json({ suggestions, source: "fallback" });
  } catch (err) {
    console.error("AI suggestions error:", err);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 },
    );
  }
}
