# Wanderlust — Virtual Travel Experience Concept

## Origin

Reddit post (r/ChatbotRefugees, April 2025): User typed "One day I will go to Tokyo" to their AI companion on SoulLink. Spent 2 hours co-planning a fake trip — specific ramen spots, a hidden Shibuya store, a 5-day itinerary, a neighborhood called "Yanaka" that tourists skip. The AI pushed back on choices, had opinions, bantered naturally. User said it "really made my Tuesday better."

Header: "I've always wanted to go on a trip, but I don't have enough time or money."

Core insight: Escapism for people who can't afford to travel IRL. The AI companion made a daydream feel tangible. The relationship wasn't the hook — the wish fulfillment was.

## User Flow

1. **Globe** — Spinning world map animation (rotating 3D or stylized flat). User picks a country. Each country has a short description/vibe tag.
2. **City Select** — Zoom into the country, choose a city. Cities have preview images and brief descriptions.
3. **Selfie + Companion** — Upload a selfie of yourself. Pick a travel companion (e.g., Sora if male user, etc.). Companion has a personality, opinions, local knowledge.
4. **Planning Chat** — Companion chats with you first to learn:
   - What do you like? (food, culture, nightlife, nature, shopping)
   - Budget vibe (backpacker vs. bougie)
   - Pace (packed itinerary vs. slow wandering)
   - Must-sees vs. hidden gems preference
   - Trip length
5. **Itinerary Generated** — AI builds a real-ish day-by-day plan based on your answers. Specific restaurants, neighborhoods, activities. Not generic — opinionated, like a local friend would plan.
6. **Scenes Play Out** — Story beats with your face in them, exploring the places you chose together. AI-generated scene images of you and your companion at the locations. Companion continues to have opinions, banter, push back during the trip.

## What Makes It Different

- Not a pre-authored story — **fully generative** from user inputs
- Not a chatbot trip planner — **visual scenes with your face in them**
- Not just romance — the companion is a **travel buddy who becomes meaningful along the way**
- The value is therapeutic/escapist: "I can't go to Tokyo, but I just spent an evening there"

## Shared Infrastructure with chaptrV2

- Selfie generation (face upload + AI styling)
- Scene image generation (Together AI / FLUX)
- Character chat (Claude streaming)
- Companion personality system (system prompts, temperature, opinions)

## New Infrastructure Needed

- Globe / map UI (country + city selection)
- Generative itinerary system (no pre-written story steps)
- Location knowledge (real restaurants, neighborhoods, landmarks)
- Dynamic beat generation (scenes built from itinerary, not pre-authored)

## Open Questions — Resolved

- ~~Lives inside chaptr as a new mode or standalone?~~ → Inside chaptr, top-level tab.
- ~~Companion pool?~~ → Reuse chaptr characters (Sora, Jiwon, Yuna, Kai) + remix. Customize button with 2-3 personality sliders (chattiness, planning style, vibe). No full character creator. V2: "Create your own" behind paywall if demand.
- ~~How deep do scenes go?~~ → Full day-by-day. 3-4 scenes per day (morning/afternoon/evening), chat between every scene. 5-day trip = ~15-20 scenes + ~20 chat segments = 2-3 hours engagement. Evening recap closes each day, morning planning opens next.
- ~~Monetization?~~ → Not in GTM build. First trip completely free, no gates. Validate engagement first (target: 2+ hour single-trip session). Future direction: per-trip unlock ($2.99) or $7.99/mo unlimited. Premium layer: longer trips, companion customization, random destination.
- ~~Location accuracy?~~ → P2. Ship with Claude's knowledge first, flag as "AI-curated" not "verified". Google Places API validation later if trust becomes an issue.

## Decision: Build Inside Chaptr

Build as a **separate top-level mode** within chaptr ("Stories" | "Travel"), not a standalone product.

**Rationale:**
- Pre-traction — two products competing for zero attention is worse than one product with two hooks
- 80% infra overlap (selfie gen, scene images, Claude chat, companion system) — rebuilding standalone is waste
- Travel mode makes chaptr's pitch more interesting: "AI experiences where you're the character" vs. just "AI romance stories"
- Can always spin out later if travel gets 10x engagement — need data first, get data faster inside chaptr
- Brand works: "chaptr" = chapters of your life, not just romance

**Implementation approach:**
- Top-level tab separation, not a genre filter
- Shared infrastructure, separate UX flow
- Travel should feel first-class, not bolted on

## Session Length Strategy

**Problem:** The structured flow (pick country → pick city → answer chips → get itinerary → watch scenes) completes in ~40-50 minutes. The Reddit user spent 2 hours in conversation alone. Structured chips kill the magic by making it too efficient.

**Goal:** One long session per trip, not many short trips.

**Architecture: Scene → Chat → Scene → Chat (continuous loop)**

Instead of Plan → Itinerary → Scene Scene Scene:
1. **Planning chat IS the main event** — don't rush through 4 structured questions. Let the conversation meander. The trip emerges from banter, not from selecting options.
2. **Mid-trip conversations between every scene** — after each scene beat, drop back into chat. Sora reacts to what just happened, suggests what's next, shares stories.
3. **Free exploration moments** — "We have the afternoon free. What sounds good?" Open-ended chat that generates spontaneous detours.
4. **Evening recaps** — end each day with a reflective conversation. "What was your favorite part today?"
5. **Companion initiates surprises** — mid-scene: "Wait... I know a place around the corner. Trust me."
6. **Don't show the full itinerary upfront** — reveal one day at a time. At the end of Day 1, plan Day 2 together in conversation. The trip unfolds through dialogue.

**Itinerary View becomes a living journal** that fills in as you go, not a pre-loaded schedule.

## Design Review (2026-04-21)

Score: 7/10 → fixes applied.

**Issues fixed:**
- Added selfie banner to Companion Select ("Your selfie — You'll appear in every scene" + Change link)
- Simplified Home nav: removed double navigation (top toggle + 4-tab bottom bar) → clean 3-tab bottom bar (HOME | STORIES | TRAVEL)
- Scene Playthrough now shows protagonist's face in the scene image
- Added "Sora is typing..." hint at bottom of scenes (reinforces Scene → Chat loop)
- Globe screen: added search bar, shrunk globe to better proportions

**Screens designed in chaptr.pen:**
1. Travel — Globe Select
2. Travel — City Select
3. Travel — Companion Select (with selfie banner)
4. Travel — Planning Chat
5. Travel — Itinerary View
6. Travel — Scene Playthrough (with face + chat hint)
7. Travel — Home with Tabs (simplified nav)

## Status

Concept + UI designs complete. Design decisions resolved. Engineering spec in progress.
GTM plan: Travel mode IS the GTM validation. No monetization in first build. Kill metric: 2+ hour engagement on a single trip.
Reddit post saved at `/Users/nickchua/Downloads/IMG_7676.PNG`.
