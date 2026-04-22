# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress — all changes pushed to main

## Done This Session

### Homepage Redesign — Twin-First Layout
- **Twin Hero** — user's selfie is now the dominant visual element on the homepage. Large image (240px mobile, 300px desktop) with name + archetype bio in a side-by-side layout (stacked on mobile). Gradient fades only at the image/text boundary, face fully visible.
- **Twin Switcher** — if multiple twins exist, small avatar dots appear below the hero. Active twin has pink border + larger size. Click to switch. "+" button to create new twin (max 3).
- **Upload CTA Hero** — when no character exists, the upload selfie prompt IS the hero (large, impossible to miss) instead of a small banner.
- **Mode Toggle** — redesigned from pill switcher to two side-by-side cards showing "Travel Mode" / "Story Mode" with one-liner descriptions. Active card gets tinted background.
- **Travel Browse** — only shows unlocked destinations in a 2-col grid + "View all destinations" button linking to `/travel`. Removed all "coming soon" locked cities from homepage.
- **Stories Browse** — matching 2-col grid (same card heights as travel). Genre tags now pill-styled with tinted backgrounds for readability. Max 4 stories shown + "See all stories" button.
- **Stronger gradients** — both travel and story cards have heavier bottom gradients so text is always readable against any image.
- **Vibe tag pills** — travel destination tags (e.g., "neon streets", "ramen culture") now individual pills with purple tinted background instead of raw text on image.
- **Genre tag pills** — story genre labels (ROMANCE, MYSTERY etc) now have semi-transparent pink background pills.
- **Removed from homepage** — Cast section, description text walls, companion/Sora cards, ping cards still exist but deprioritized below browse.

### Character Flow Fixes
- **CreateCharacterPage** — now redirects to `/` (homepage) after creation instead of `/characters`
- **CharacterSelectPage** — no longer launches into a story when clicking a twin. Now pure management: set active, delete, create new. Active twin gets "Active" badge.

### Sidebar Consistency
- Renamed sidebar nav items to "Travel Mode" and "Story Mode" to match homepage toggle.

### Build Fixes
- Removed unused imports (Pencil, useMemo, Lock, Plane, getAffinityTier, PREVIEW_GENRES, LOCKED) across HomePage, CharacterSelectPage, TravelHomePage
- Committed missing store changes (setActiveTripId) that were modified locally but not pushed

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
- Test twin switching with multiple characters
- Verify travel destinations link correctly from homepage cards
- Verify story cards link correctly to universe pages

### 2. Landing page — better Travel/Story mode icons
- User asked to "explore better icons" for mode cards — unresolved from previous session

### 3. GTM launch
- GTM-PLAYBOOK.md is ready — execute channel strategy
- 7 available destinations should be enough for launch
- Need screenshots from playtest for Reddit/Twitter posts

## Key Files
- `src/pages/HomePage.tsx` — twin-first homepage with hero, mode toggle, browse grids
- `src/pages/CharacterSelectPage.tsx` — twin management (set active, delete, create)
- `src/pages/CreateCharacterPage.tsx` — selfie upload + archetype selection
- `src/pages/StoriesHomePage.tsx` — full stories grid with genre filters
- `src/pages/TravelHomePage.tsx` — globe + destination grid
- `src/components/AppSidebar.tsx` — sidebar nav with "Travel Mode" / "Story Mode"
- `src/data/travel/destinations.ts` — 30 destinations with coords, images, locationKnowledge
- `src/store/useStore.ts` — characters, trips, story progress, cityVotes

## Blockers
- None currently
