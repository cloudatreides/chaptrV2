# Chaptr Travel Mode — GTM Seeding Playbook

## Objective

30 real users in week 1. Kill metric: 25%+ complete the full Tokyo flow (planning chat → 5 days of scenes → trip complete).

**Decision gate — Day 8:**
- \>40% completion → expand to Seoul, add second companion
- 25–40% → iterate on drop-off points, re-seed
- <25% → pivot to Seoul Transfer story GTM (proven loop)

---

## Product URL

https://chaptr-v2.vercel.app

## What the user gets

Pick Tokyo → choose an AI companion (Sora/Jiwon/Yuna/Kai) → planning chat where the companion helps build an itinerary → 5-day trip with AI-generated scenes, companion banter between each scene, day transitions, and a trip complete screen with stats + AI summary. ~1–2 hours of engagement per trip.

---

## Channel Strategy

### Tier 1 — High intent, low ban risk

#### 1. r/CharacterAI (1.2M members)

- **Why:** Audience actively looks for AI companion experiences. Travel mode is a novel angle they haven't seen.
- **Angle:** "I built a thing where your AI companion actually travels with you"
- **Post type:** Text post with 2–3 screenshots (scene image + companion chat + trip complete stats)
- **Framing:** Share as a personal project, not a product launch. "Been working on this for a few weeks" energy.
- **Title draft:** "Made something different — an AI travel companion that plans and goes on a trip with you through Tokyo"
- **Body draft:** "Instead of just chatting, you actually go places together. Your companion helps plan the itinerary, reacts to each scene, and remembers what you talked about. Did a full 5-day Tokyo trip with Sora and it took about 2 hours. The scenes are AI-generated based on your actual itinerary. Free, no login wall. Would love feedback on what works / what doesn't."
- **CTA:** Link in body, not title. Frame as "try it and tell me what sucks."
- **Timing:** Tuesday or Wednesday, 10am–12pm EST (US peak)
- **Risk:** Low. Sub is friendly to indie AI projects. Avoid anything that looks like marketing copy.

#### 2. r/ChatbotRefugees (~15k members)

- **Why:** Users actively seeking CharacterAI alternatives. Smaller but high-conversion.
- **Angle:** "Built an AI companion experience that isn't just chat"
- **Post type:** Same as r/CharacterAI but emphasize no filters, no NSFW wall, free.
- **Title draft:** "Built something where you actually travel with your AI companion (not just chat)"
- **Body draft:** Shorter version of above. Emphasize: free, no account required, no content filters on companion personality.
- **Timing:** Same day as r/CharacterAI post, 2 hours later.
- **Risk:** Low. Sub exists for alternatives.

### Tier 2 — High reach, moderate ban risk

#### 3. r/internetisbeautiful (17M members)

- **Why:** Massive reach. Audience loves novel web experiences. Travel mode is visually impressive.
- **Angle:** Pure "look at this cool thing" energy. Zero self-promotion framing.
- **Post type:** Link post (direct to chaptr-v2.vercel.app)
- **Title draft:** "AI travel companion that plans and walks you through a 5-day trip in Tokyo with generated scenes"
- **Rules to follow:** Must be a direct link post (no text body). Title must describe what it does, not sell it. Don't say "I made" — say "An AI travel companion that..."
- **Timing:** Monday 9am EST. This sub peaks early-week.
- **Risk:** Moderate. Mods remove anything that smells commercial. The "no login required" aspect helps. If removed, don't repost.

#### 4. Twitter/X — AI product builders

- **Why:** Portfolio signal. Not for volume — for the right 10 people seeing it.
- **Thread structure:**
  - Tweet 1: Hook + 15-second screen recording of a scene playing (companion chat → scene image → next scene)
  - Tweet 2: "Built this solo with Claude Code + Pencil. The companion actually remembers what you said and adapts the itinerary."
  - Tweet 3: "Tokyo only for now. Free, no login. [link]"
- **Hashtags:** #buildinpublic #aiproducts (skip #travel — wrong audience)
- **Tag:** @AnthropicAI (built with Claude), @pencaboron (built with Pencil) — only if genuine, not thirsty
- **Timing:** Tuesday 11am EST
- **Risk:** None. Low reach unless it catches.

### Tier 3 — High intent travel audience, HIGH ban risk

#### 5. r/solotravel (2.8M members)

- **DO NOT self-promote.** This sub bans aggressively.
- **Strategy — native-first, seed later:**
  - Week 1: Post a genuine question or trip report. Example: "Planning 5 days in Tokyo solo — how realistic is it to do Shibuya, Asakusa, Akihabara, and Shimokitazawa without rushing?" Use real knowledge from the destination data baked into the product.
  - Week 1–2: Comment helpfully on other Tokyo threads. Build a post history.
  - Week 2+ (only if the product has traction): Reply to relevant threads with "I actually tried planning my trip with this AI thing that walks you through it day by day — [link]". Must feel like a genuine recommendation, not a plug.
- **Never do:** Post a "I built this" thread. Instant ban.
- **Timing:** Organic, not scheduled.
- **Risk:** High. Only proceed if week 1 numbers justify it. This is gravy, not core.

#### 6. r/JapanTravel (2.1M members)

- **Same strategy as r/solotravel.** Even stricter moderation.
- **Native-first approach:** Answer itinerary questions using the same location knowledge in the product (Shimokitazawa vintage shops, Yanaka cat street, Omoide Yokocho). Build credibility first.
- **Never post the link unprompted.** Only share if someone asks "is there a tool for this?"
- **Risk:** Very high. Treat as a month-2 channel at earliest.

---

## Timing Plan

| Day | Channel | Action |
|-----|---------|--------|
| Mon (Day 1) | r/internetisbeautiful | Link post, 9am EST |
| Tue (Day 1) | r/CharacterAI | Text post + screenshots, 10am EST |
| Tue (Day 1) | r/ChatbotRefugees | Text post, 12pm EST |
| Tue (Day 1) | Twitter/X | Thread + screen recording, 11am EST |
| Wed (Day 2) | r/solotravel | Genuine Tokyo question (no link) |
| Thu (Day 3) | Monitor + engage | Reply to all comments, fix bugs surfaced |
| Fri (Day 4) | Twitter/X | Follow-up tweet with early stats if interesting |
| Day 5–7 | Engage | Comment on travel threads, answer feedback, iterate |
| Day 8 | Decision gate | Check completion rate, decide next move |

---

## Screenshots to Prepare

Before posting, capture these from a real playthrough:

1. **Scene image** — AI-generated Tokyo scene (neon streets or temple, whichever looks best)
2. **Companion chat** — A compelling back-and-forth with Sora during planning ("What kind of food are you into?" → response → itinerary suggestion)
3. **Trip complete screen** — Stats + AI summary showing the full trip
4. **Day transition** — The "Day 2: Temples & Hidden Spots" card

For Twitter, record a 15-second screen capture of: scene loads → companion reacts → tap next → new scene. Show the loop.

---

## What to Track

Set up before Day 1:

- **Unique visitors** (Vercel analytics or Supabase event)
- **Trip started** (companion selected + planning chat opened)
- **Day 1 completed** (first day's scenes all viewed)
- **Trip completed** (reached trip complete screen)
- **Total engagement time** (already tracked in `totalEngagementMs`)
- **Referrer** (which channel drove which users)
- **Drop-off point** (which phase do people leave? planning chat? day 2? day 4?)

The kill metric is **trip completed / trip started**. 25% is the floor.

---

## Copy Bank

### One-liners (adapt per channel)

- "AI travel companion that plans and walks you through a 5-day trip in Tokyo"
- "Your AI companion doesn't just chat — they travel with you"
- "Built an AI thing where you actually go on a trip together through Tokyo"

### Objection handling (for comments)

| Objection | Response |
|-----------|----------|
| "Just use ChatGPT for itineraries" | "This isn't an itinerary generator — you experience the trip scene by scene with a companion who reacts and remembers what you talked about. More like a visual novel than a planning tool." |
| "Is this just CharacterAI with a travel skin?" | "The companion is part of it, but the core is the scene loop — AI-generated locations, day transitions, the feeling of actually being somewhere. The chat is between scenes, not the whole thing." |
| "Why would I use this instead of actually traveling?" | "You wouldn't instead of — you'd use it to daydream, plan, or just have fun with a destination you're curious about. Think of it like a travel story you participate in." |
| "Looks cool but Tokyo only?" | "Yeah, Tokyo only for now. Want to make sure it's actually good before adding more cities. What city would you want?" |

---

## Post-Mortem Checklist (Day 8)

1. How many unique users hit the site?
2. How many started a trip?
3. How many completed the trip? (kill metric)
4. Where did people drop off?
5. Which channel drove the most completions (not just visits)?
6. What feedback came in? Any patterns?
7. What broke? Any bugs surfaced by real usage?
8. Decision: expand / iterate / pivot?
