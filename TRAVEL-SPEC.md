# Travel Mode — Engineering Spec

GTM build. No monetization. One free trip (Tokyo). Kill metric: 2+ hour engagement per trip.

## Architecture Overview

Travel mode reuses ~70% of existing chaptr infrastructure. The core loop is **Scene → Chat → Scene → Chat** (continuous), not a linear plan-then-play flow.

```
Globe → City → Selfie + Companion → Planning Chat → [Day Loop] → Trip Complete
                                                        ↓
                                              Scene → Chat → Scene → Chat
                                              (3-4 scenes/day, chat between each)
                                              Evening Recap → Morning Planning → next day
```

## Data Model

### Destination Registry (`src/data/travel/destinations.ts`)

```ts
interface Destination {
  id: string                    // 'tokyo'
  city: string                  // 'Tokyo'
  country: string               // 'Japan'
  countryEmoji: string          // '🇯🇵'
  vibeTags: string[]            // ['Neon Streets', 'Ramen Culture', 'Hidden Shrines']
  heroImage: string             // city card image
  tripDays: number              // 5
  description: string           // one-liner for city select
  locationKnowledge: string     // injected into Claude system prompt — neighborhoods, landmarks, food, culture
  locked: boolean               // false for Tokyo (GTM), true for future cities
}
```

GTM ships with **Tokyo only**. Other cities locked with "Coming soon" treatment. `locationKnowledge` is a ~500 word primer that grounds Claude's recommendations in real places.

### Travel Companion Config (`src/data/travel/companions.ts`)

Reuses `StoryCharacter` from `src/data/characters.ts` with travel-specific system prompts:

```ts
interface TravelCompanion extends StoryCharacter {
  travelSystemPrompt: string    // replaces story systemPrompt during travel
  travelIntro: string           // first message when selected as companion
  personalitySliders: {
    chattiness: number          // 0-100, default 50
    planningStyle: number       // 0 = spontaneous, 100 = organized
    vibe: number                // 0 = playful, 100 = thoughtful
  }
}
```

GTM companions: **Sora, Jiwon, Yuna, Kai** — same characters, new system prompts focused on travel knowledge, cultural context, and journey-building. The `personalitySliders` are user-adjustable via the Customize button on companion select.

### Trip State (`useStore.ts` addition)

```ts
interface TripProgress {
  destinationId: string
  companionId: string
  companionSliders: { chattiness: number; planningStyle: number; vibe: number }
  currentDay: number             // 1-indexed
  currentSceneIndex: number      // within the day
  phase: 'planning' | 'day' | 'recap' | 'complete'
  planningChatHistory: ChatMessage[]
  dayChatHistories: Record<number, ChatMessage[]>  // keyed by day
  itinerary: TripItinerary
  sceneImages: Record<string, string>  // keyed by scene ID
  travelAffinityScore: number    // companion rapport, 0-100
  companionMemories: string[]    // extracted from conversations
  startedAt: number
  totalEngagementMs: number      // tracked for kill metric
}

interface TripItinerary {
  days: TripDay[]
}

interface TripDay {
  dayNumber: number
  theme: string                  // 'Shibuya & Street Food', 'Temples & Hidden Spots'
  scenes: TripScene[]
  plannedInChat: boolean         // true after planning conversation for this day
  completed: boolean
}

interface TripScene {
  id: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  location: string               // 'Tsukiji Outer Market'
  activity: string               // 'trying fresh tuna at a tiny counter-only stall'
  imagePrompt: string            // for FLUX generation
  protagonistVisible: boolean    // true = use Kontext with selfie
  prose: string | null           // generated when scene plays
  companionReaction: string | null
}
```

### Store Shape

Add to existing Zustand store:

```ts
// Keyed by playerCharacterId
travelTrips: Record<string, TripProgress>
activeTripId: string | null

// Actions
startTrip: (destinationId: string, companionId: string, sliders: {...}) => void
advanceScene: () => void
advanceDay: () => void
completeTrip: () => void
updateTripItinerary: (day: TripDay) => void
addTravelChatMessage: (day: number, message: ChatMessage) => void
updateTravelAffinity: (delta: number) => void
```

## Generative Systems

### 1. Planning Chat → Day 1 Itinerary

The planning chat is the main event. No structured chips. Companion asks open-ended questions, banter builds naturally.

**Flow:**
1. Companion sends opening message (travelSystemPrompt + destination context)
2. Free-form chat (no exchange limit during planning — user ends it naturally or companion suggests "let's start exploring")
3. After 5+ exchanges, companion starts weaving plan suggestions into conversation: "So we're definitely hitting Shibuya... and you mentioned ramen..."
4. When chat ends (user taps "Start exploring" or companion wraps), generate Day 1 itinerary from conversation

**Itinerary Generation** (`src/lib/claude/travel.ts` — new module):

```ts
async function generateDayItinerary(params: {
  destination: Destination
  companionId: string
  planningHistory: ChatMessage[]
  dayNumber: number
  previousDays: TripDay[]
  playerPreferences: string  // extracted from planning chat
}): Promise<TripDay>
```

System prompt injects `destination.locationKnowledge` + conversation context. Claude returns structured JSON: 3-4 scenes with location, activity, timeOfDay, imagePrompt.

### 2. Scene Generation (Streaming Prose)

Reuses the streaming architecture from `src/lib/claude/core.ts`:

```ts
async function* streamTravelScene(params: {
  scene: TripScene
  destination: Destination
  companion: TravelCompanion
  tripContext: string         // summary of trip so far
  recentChat: ChatMessage[]   // last mid-scene conversation
  signal?: AbortSignal
}): AsyncGenerator<string>
```

Prose is 2nd person present tense, 2-4 paragraphs. Describes arriving at the location, sensory details, companion's reaction. Ends on a moment that invites conversation.

### 3. Mid-Scene Chat

After every scene, drop into chat with the companion. This is where engagement lives.

**Chat types:**
- **Reaction chat**: Companion reacts to what just happened ("That tuna was incredible. Did you see the chef's face when you asked for extra wasabi?")
- **Planning chat**: Companion suggests next activity or asks what player wants ("We have the afternoon free. There's this vintage vinyl shop I've been wanting to check out... or we could wander through Yanaka")
- **Surprise chat**: Companion initiates a detour ("Wait. I know a place. Just trust me.")
- **Recap chat**: End of day reflection ("What was your favorite moment today?")

All use the existing `streamChatReply` from `src/lib/claude/chat.ts` with travel-specific system prompt injection. The `buildChatSystemPrompt` helper already supports this — pass `genre: 'TRAVEL'` and add travel-specific rules similar to the romance rules.

### 4. Day Progression

```
Day starts → Morning planning chat → Scene 1 → Chat → Scene 2 → Chat → Scene 3 → Chat → Evening recap → Day ends
```

At end of each day:
1. Evening recap chat (companion asks about highlights)
2. Itinerary journal updates (what happened today)
3. Generate next day's itinerary from the recap + remaining preferences
4. Morning planning chat opens next day

Day 1 is generated from planning chat. Days 2-5 are generated progressively — each night's recap feeds into next morning's plan. This is the "reveal one day at a time" strategy.

### 5. Image Generation

Reuses `src/lib/togetherAi.ts` directly:
- **Location scenes** (protagonist not visible): Schnell, $0.04/image
- **You-at-location scenes** (protagonist visible): Kontext with selfie reference, $0.20/image

Budget per trip (5 days × 3-4 scenes): ~$3-4 in image gen at current mix.

Image prompts are generated by Claude as part of scene generation and stored in `TripScene.imagePrompt`.

## New Files

```
src/data/travel/
  destinations.ts          — destination registry (Tokyo + locked placeholders)
  companions.ts            — travel companion configs (reuse character IDs, new system prompts)

src/lib/claude/travel.ts   — travel-specific Claude functions:
                              generateDayItinerary()
                              streamTravelScene()
                              generateTripSummary()

src/pages/
  TravelHomePage.tsx        — globe/destination select (route: /travel)
  TravelCityPage.tsx        — city detail + companion select (route: /travel/:destinationId)
  TravelReaderPage.tsx      — main trip experience: scenes + chat (route: /travel/trip)
  TravelJournalPage.tsx     — trip journal/recap (route: /travel/journal)

src/components/travel/
  GlobeSelect.tsx           — animated destination picker
  CityGrid.tsx              — city cards with images + vibe tags
  CompanionSelect.tsx       — companion cards with customize sliders
  TravelScene.tsx           — scene display (image + prose + "chat with companion" CTA)
  TravelChat.tsx            — chat UI (reuse ChatScene patterns)
  ItineraryJournal.tsx      — living itinerary that fills in as trip progresses
  DayTransition.tsx         — day end/start transitions
```

## Router Additions

```tsx
<Route path="/travel" element={<ProtectedRoute><TravelHomePage /></ProtectedRoute>} />
<Route path="/travel/:destinationId" element={<ProtectedRoute><TravelCityPage /></ProtectedRoute>} />
<Route path="/travel/trip" element={<ProtectedRoute><TravelReaderPage /></ProtectedRoute>} />
<Route path="/travel/journal" element={<ProtectedRoute><TravelJournalPage /></ProtectedRoute>} />
```

Bottom tab bar: HOME | STORIES | TRAVEL (matches Pencil designs).

## Engagement Tracking

Track `totalEngagementMs` in `TripProgress`. Start timer when trip reader is active, pause on blur/background. This is the kill metric — target 2+ hours per trip.

Also track:
- Messages sent per day (are they chatting or skipping?)
- Days completed (do they finish the trip?)
- Scene-to-chat ratio (are they spending time in chat or rushing through scenes?)

Store in Zustand for now. Push to Supabase if/when we add analytics.

## Build Order

### Phase 1 — Data + State (1 session)
1. Destination registry (Tokyo + 3-4 locked placeholders)
2. Travel companion configs (Sora, Jiwon, Yuna, Kai with travel system prompts)
3. Store additions (TripProgress, actions)

### Phase 2 — Claude Travel Module (1 session)
4. `src/lib/claude/travel.ts` — itinerary generation, scene streaming, trip summary
5. Test: generate a Day 1 itinerary from a mock planning conversation

### Phase 3 — Selection Flow UI (1 session)
6. TravelHomePage (globe/destination select)
7. TravelCityPage (city detail + companion select with sliders)
8. Router + bottom tab bar update

### Phase 4 — Core Trip Experience (2 sessions)
9. TravelReaderPage — scene display + prose streaming
10. TravelChat — mid-scene companion chat
11. Day progression (scene → chat → scene → chat → recap → next day)
12. Itinerary journal (living view)

### Phase 5 — Polish + Test (1 session)
13. Day transitions, engagement timer
14. End-to-end playtest: full Tokyo trip
15. Edge cases: resume interrupted trip, companion memory across days

**Estimated total: 6 sessions**

## What This Spec Does NOT Cover

- Monetization (deferred — validate engagement first)
- Multiple simultaneous trips
- Location verification (Google Places API — P2)
- Trip sharing / social features
- Additional destinations beyond Tokyo
- Travel-specific pings/notifications between trips
