# Chaptr V2 — Current Session State

## In Progress
- Globe visual polish — just switched to hover-to-reveal labels, needs final check in browser
- Uncommitted changes: TravelHomePage globe refinements (arcs, rings, HTML overlay labels). Run `git add` + `git commit` + `git push` to ship.

## Done This Session

### Interactive Globe (TravelHomePage)
- **react-globe.gl integration** — dark earth texture, purple atmosphere, auto-rotating globe at `/travel`
- **HTML overlay markers** — available cities show as emoji flag dots (28px circles), hover reveals city name label above. Locked cities show as small 8px dim dots with hover label. No overlap in dense regions (Asia cluster solved).
- **Animated arcs** — dashed purple flight-path lines connecting all 7 available cities, slowly animating along the path
- **Pulsing rings** — ripple effect at each available city location
- **Click-to-zoom** — clicking any marker stops rotation, camera zooms to city, shows detail card with hero image, description, vibe tags, and CTA
- **City vote system** — locked cities show "I want to go here" button, click changes to "Noted — we'll build it next". Votes persisted in Zustand store (`cityVotes` array).

### 30 Destinations
- **7 available** (unlocked with full locationKnowledge + companion intros): Tokyo, Seoul, Bangkok, Taipei, Marrakech, Kyoto, Medellin
- **23 coming soon** (locked): Paris, New York, London, Istanbul, Mexico City, Lisbon, Sydney, Buenos Aires, Reykjavik, Hanoi, Cape Town, Porto, Cartagena, Dubrovnik, Luang Prabang, Chiang Mai, Tbilisi, Oaxaca, Jaipur, Valletta, Cairo, Zanzibar, Sarajevo
- Unique/off-beaten-path picks mixed in: Tbilisi, Luang Prabang, Valletta, Zanzibar, Sarajevo, Oaxaca
- **19 Pencil-generated cover images** for all new destinations (saved as `/public/dest-[city].png`)

### Grid Layout Overhaul
- Split into "Available Now" (purple accent, full-brightness) and "Coming Soon" (grey, smaller cards, dimmed images) sections
- Available: 2-col / 4-col grid. Coming soon: 3-col / 5-col / 6-col tighter grid.

### Companion Intros
- Added city-specific `travelIntroByCity` entries for all 7 unlocked cities across all 3 companions (Sora, Jiwon, Yuna)

### Store Changes
- Added `cityVotes: string[]` and `voteCityRequest(cityId)` to Zustand store, persisted via partialize

## Done Previous Sessions
- **Travel Mode fully built (Phases 1-5)** — all pushed to prod
- Homepage toggle (Travel/Stories), genre-grouped story previews, dedicated `/stories` page
- Landing page: removed all "AI" terminology, scroll-to-section on mode card click, Pencil destination images
- Seoul unlocked with full locationKnowledge, destination-aware companion intros
- Travel Mode concept + UI screens in chaptr.pen
- Previous: multi-chapter infra, share CTA, pings, stories, feedback modal, mobile polish

## Next

### 1. Commit + push globe refinements
- Stage TravelHomePage.tsx changes (arcs, rings, HTML overlays), commit, push to main

### 2. Full browser playtest of travel flow
- Start fresh trip with each available destination (especially new ones: Bangkok, Taipei, Marrakech, Kyoto, Medellin)
- Verify companion intros are city-specific, locationKnowledge feeds into planning chat
- Test globe: hover labels, click-to-zoom, arc animations, ring pulses
- Test vote button on locked cities

### 3. Landing page — better Travel/Story mode icons
- User asked to "explore better icons" for mode cards — unresolved from previous session

### 4. GTM launch
- GTM-PLAYBOOK.md is ready — execute channel strategy
- 7 available destinations should be enough for launch
- Need screenshots from playtest for Reddit/Twitter posts

## Key Files
- `src/pages/TravelHomePage.tsx` — globe + destination grid + city detail cards
- `src/data/travel/destinations.ts` — 30 destinations with coords, images, locationKnowledge
- `src/data/travel/companions.ts` — 3 companions with city-specific intros
- `src/store/useStore.ts` — cityVotes persistence
- `public/dest-*.png` — 19 Pencil-generated destination cover images

## Blockers
- None currently
