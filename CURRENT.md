# Chaptr V2 — Current Session State

## In Progress
- GTM launch prep — travel mode built, needs testing + landing page + seeding plan

## Done Previous Sessions
- **Travel Mode fully built (Phases 1-5)** — all pushed to prod:
  - claudeStream.ts refactored into 6 modules under `src/lib/claude/`
  - Phase 1: destinations (Tokyo + 3 locked), companions (Sora/Jiwon/Yuna), 15 store actions
  - Phase 2: `claude/travel.ts` — itinerary gen, scene streaming, 6 chat modes, trip summary
  - Phase 3: TravelHomePage, TravelCityPage, routes, sidebar nav
  - Phase 4: TravelReaderPage — planning chat → scene → chat → scene loop, AI images, engagement tracking
  - Phase 5: DayTransition, TripComplete screen with stats + AI summary, companion memory extraction
  - tsc + vite build clean, pushed to main
- Travel Mode concept + 7 original UI screens + 2 travel-first redesign screens in chaptr.pen
- wanderlust.md — resolved design decisions (scene depth, companion remix, monetization deferred)
- TRAVEL-SPEC.md — full engineering spec
- Previous: multi-chapter infra, share CTA, pings, stories, feedback modal, mobile polish

## Next

### 1. Test in browser
- Run dev server, create character, do full Tokyo trip with Sora
- Test: planning chat flow, itinerary generation, scene images, scene→chat→scene loop, day transitions, trip complete
- Fix bugs found during playtest

### 2. Landing page refactor
- Pencil designs exist in chaptr.pen: travel-first hero ("Travel anywhere. With anyone."), Sora chat preview, "Plan Your First Trip" CTA
- "Also on Chaptr" section for stories (secondary)
- Popular destinations grid
- Current landing page still leads with stories — needs full rewrite to lead with travel

### 3. Homepage restructure
- Pencil designs: "Where to next?" header, continue trip card, "Plan a new trip" CTA
- Secondary "Interactive Stories" row
- 3-tab bottom bar (HOME | STORIES | TRAVEL)

### 4. GTM seeding plan (needs to be built out)
- **Goal:** 30 users in first week, kill metric: 25%+ complete the full Tokyo flow
- **Decision gate Day 8:** >40% = expand cities, 25-40% = iterate, <25% = pivot to Seoul Transfer GTM
- **Channels to plan:**
  - Reddit: r/CharacterAI, r/ChatbotRefugees, r/solotravel, r/JapanTravel, possibly r/internetisbeautiful
  - Twitter/X: AI product community, solo travel niche
  - WARNING: Many subreddits (especially r/solotravel, r/JapanTravel) will ban for self-promotion. Need native-first posting strategy per sub — share the experience, not the product.
  - Need: per-channel approach, post framing, timing, what angle works where
- **Task for next session:** Build full GTM seeding playbook — channel selection, post strategy per sub, risk assessment, copy drafts, timing plan

## Blockers
- None currently
