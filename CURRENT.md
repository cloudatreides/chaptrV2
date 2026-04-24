# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress — all changes pushed to main

## Done This Session

### Two-Pass Image Generation (Companion Face Consistency)
- Prototyped two-pass approach: Pass 1 uses Kontext Pro with user selfie → Pass 2 uses Kontext Pro again to edit companion's appearance into the scene
- Extended `GenerateSceneParams` with `companionReferenceUrl` and `companionDescription`
- Added `refineCompanionFace()` function in `togetherAi.ts` — takes scene URL + companion description, sends Kontext edit request
- `generateSceneImage` now runs pass 2 automatically when companion data is provided
- `generateTravelImage` in TravelReaderPage passes companion portrait + description from `companion.character.portraitPrompt`
- Cost: $0.20 (pass 1) + $0.20 (pass 2) = $0.40 per scene with both faces

### Chat Image UX Improvements
- Toast notification on image generation failure ("Image couldn't be generated") for holdHands, buyGift, selfie actions
- Loading shimmer placeholder during image generation (`scene-image-shimmer` class)
- Consistent image card treatment: all chat images get `rounded-xl`, `border: 1px solid rgba(255,255,255,0.08)`, `aspect-ratio: 16/9`
- Framer Motion entrance animation on all image cards (fade up + scale)

### Action Beats Consistency
- Added `TRAVEL_WRITING_RULES` to companion system prompts: dialogue-only, no asterisks, no em dashes
- Added asterisk ban to scene prose prompt in `travel.ts`
- `parseSegments` function splits content into text vs action beats
- `ActionBeat` component renders beats consistently (small italic gray) in both prose and chat
- System-generated scene context divider replaces narrative bridge text (shows location + time of day)

### Text Readability Fixes
- Companion chat bubbles: `rgba(255,255,255,0.8)` → `text-white`
- Prose narration: `text-white/85` → `text-white`

### Companion Remix Flow Fix
- Restored `handleOpenProfile` in TravelCityPage (was accidentally removed in prior commit)
- Base companion card click → opens profile modal (where remix button lives)
- Removed visible "Remix" text link from cards

### Globe Expansion
- Unlocked 6 more cities: New York, Istanbul, Lisbon, Buenos Aires, Cape Town, Dubrovnik
- Total active cities: 13 (was 7)
- Each city got highlights arrays for the detail panel

## Done Previous Sessions
- Day transition screens redesign (full-screen atmospheric)
- 28 destination cover images generated via Pencil AI
- Food image support in travel chat ([FOOD:] tags)
- Landing page destination preview modal
- Companion cards redesign (full portrait style)
- Side-by-side globe + city panel layout
- Scene generation timeouts (30s image, 45s prose)
- Safari layout fixes
- Companion remix persistence (Supabase sync)
- "Show me" UX redesign, trip progress sidebar tooltips
- Landmark photo feature (Wikipedia/Google API)
- Globe UX overhaul, multi-trip support, visitor social proof
- Twin-first homepage redesign, sidebar icon consistency
- Travel Mode fully built (Phases 1-5), companion remix system
- StoriesHomePage with genre filters, multi-chapter infra
- Lofi beats background music in travel reader

## Next

### 1. Test two-pass image generation
- Trigger a scene with companion (hold hands, selfie, or natural scene)
- Check console for `[Companion refine] done in Xs` logs
- Evaluate face consistency quality — if text-only companion descriptions aren't enough, may need multi-reference model or different API

### 2. Full browser playtest
- Test food image feature end-to-end
- Test side-by-side globe layout on different screen sizes
- Test landing page destination modal on mobile
- Verify Safari layout fixes

### 3. GTM launch
- GTM-PLAYBOOK.md is ready — execute channel strategy
- 13 available destinations, 7 playable stories
- Need screenshots from playtest for Reddit/Twitter posts

## Key Files
- `src/pages/TravelReaderPage.tsx` — travel chat, food images, scene timeouts, two-pass image gen, action beats
- `src/pages/TravelCityPage.tsx` — full portrait companion cards, compact twin banner, remix flow
- `src/pages/TravelHomePage.tsx` — side-by-side globe + city panel layout, vibe tag pills
- `src/pages/HomePage.tsx` — twin-first homepage, Safari fixes, continue cards
- `src/pages/LandingPage.tsx` — landing page with destination preview modal, carousel
- `src/lib/togetherAi.ts` — scene generation, two-pass companion refine, prompt-hash caching
- `src/lib/claude/travel.ts` — travel prompts with [PLACE:] and [FOOD:] tags, prose prompt
- `src/data/travel/companions.ts` — TRAVEL_WRITING_RULES, companion definitions
- `src/data/travel/destinations.ts` — 13 active cities with highlights
- `src/store/useStore.ts` — characters, trips, customCompanions, persist v9
- `src/lib/imageSearch.ts` — place + food image fetching + tag parsing
- `api/together.ts` — Vercel Edge proxy for Together AI

## Blockers
- Safari selfie image not loading (likely base64 data URL too large — re-uploading selfie to get Supabase URL should fix)
- Two-pass companion refinement quality unknown — needs live testing
