# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress — all changes pushed to main

## Done This Session

### Globe UX Overhaul (7 improvements)
- **Stronger atmosphere** — `atmosphereAltitude` 0.15→0.2, radial glow behind globe bumped to 0.14 opacity
- **Always-visible city labels** — non-locked markers show labels at 0.7 opacity by default, not hover-only
- **Selected marker highlight** — clicked marker scales up with brighter border + glow, persists until deselected
- **Contextual arcs** — replaced N² arc clutter with arcs from selected city only (sequential chain when idle)
- **Overlay city card** — card now floats over the bottom of the globe instead of pushing content below the fold
- **Loading skeleton** — pulsing gradient placeholder while globe loads, then 0.8s fade-in
- **Slower ring pulses** — `ringMaxRadius` 2.5→3.5, `ringPropagationSpeed` 1.5→1.0

### Multi-Trip Support
- "Continue your trip" section now shows all active trips as compact rows (emoji + city + day + phase badge)
- Added `setActiveTripId` store action so clicking any trip card sets the right context before navigating

### Visitor Social Proof
- Selected city card shows overlapping anime avatar stack + "X exploring" count
- 38 anime-style profile portraits generated via Pencil AI, exported as webp to `public/avatars/`
- Deterministic mock data seeded from destination ID (stable counts per city, different avatar sets)

### Previous Session — Icon Consistency + Homepage Redesign
- Sidebar icons swapped: Sparkles for Travel, BookOpen for Story
- Twin-first homepage layout with hero selfie, mode toggle cards, browse grids
- Character flow fixes (redirect after creation, management-only select page)

## Done Previous Sessions
- Interactive globe on TravelHomePage (react-globe.gl, arcs, rings, HTML overlay labels, click-to-zoom)
- 30 destinations (7 unlocked, 23 coming soon) with Pencil-generated cover images
- Travel Mode fully built (Phases 1-5), all pushed to prod
- StoriesHomePage dedicated page with genre filters
- Landing page refinements, scroll-to-section, removed "AI" terminology
- Seoul unlocked with full locationKnowledge
- Multi-chapter infra, share CTA, pings, stories, feedback modal, mobile polish

## Next

### 1. Full browser playtest
- Test homepage flow: no character → upload → hero appears → browse travel/stories
- Test globe UX: markers, overlay card, visitor avatars, multi-trip cards
- Verify travel destinations link correctly from homepage cards
- Verify story cards link correctly to universe pages

### 2. GTM launch
- GTM-PLAYBOOK.md is ready — execute channel strategy
- 7 available destinations should be enough for launch
- Need screenshots from playtest for Reddit/Twitter posts

## Key Files
- `src/pages/HomePage.tsx` — twin-first homepage with hero, mode toggle, browse grids
- `src/pages/TravelHomePage.tsx` — globe + overlay card + visitor avatars + multi-trip
- `src/pages/CharacterSelectPage.tsx` — twin management (set active, delete, create)
- `src/pages/CreateCharacterPage.tsx` — selfie upload + archetype selection
- `src/pages/StoriesHomePage.tsx` — full stories grid with genre filters
- `src/components/AppSidebar.tsx` — sidebar nav with "Travel Mode" / "Story Mode"
- `src/data/travel/destinations.ts` — 30 destinations with coords, images, locationKnowledge
- `src/store/useStore.ts` — characters, trips, story progress, cityVotes, setActiveTripId
- `public/avatars/` — 38 anime-style profile pics for visitor social proof

## Blockers
- None currently
