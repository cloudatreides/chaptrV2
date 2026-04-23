# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress — all changes pushed to main

## Done This Session

### Companion Remix Persistence (Supabase)
- Moved `customCompanions` from ephemeral React `useState` to Zustand store
- Added `addCustomCompanion`, `updateCustomCompanion`, `deleteCustomCompanion` store actions
- Added to `partialize` (localStorage), `useGameStateSync` (auto-sync), and `AuthContext` signOut save
- Bumped persist version to 9 with migration
- `CustomCompanion` type exported from store, removed duplicate interface from TravelCityPage

### "Show me" UX Redesign
- Removed ambiguous camera icon from chat input bar
- Added "Show me" pill button in suggestions row (generates AI image of what companion is describing)
- Uses `ImagePlus` icon, shows spinner during generation, disabled when no companion messages

### Trip Progress Sidebar Tooltips
- Locked items show hover tooltips explaining how to unlock (e.g., "Chat with your companion to plan your trip first")
- "Start exploring" shows subtle "Ready when you are" hint when unlocked

### Landmark Photo Feature (Real Images)
- Created `/api/image-search.ts` Vercel Edge Function — searches Wikipedia API (free, no key) with Google Custom Search as optional upgrade
- Created `src/lib/imageSearch.ts` — client-side util with in-memory cache, `fetchPlaceImage()` and `parsePlaceTags()`
- Added `[PLACE:Name]` tag instruction to Claude travel chat system prompt (max 1 per message, notable landmarks only)
- Prompt tells Claude the system auto-shows photos — never say "I can't show images"
- Tags stripped during streaming display and after completion, place names preserved in text
- Real photos appear as standalone left-aligned cards with MapPin icon + place name caption
- All code paths covered: main chat, buy-gift handler, hold-hands handler

### Scene Image Fallback
- Scenes without images now show 200px placeholder with location name + time of day instead of collapsing to 0 height

### Companion Vibe Sliders — Save + Toast
- Sliders now buffer changes in local state instead of saving on every drag
- "Save" button appears when changes are made
- Toast notification "Companion vibe updated" on save (2s fade)

### Hold Hands Fix
- Image prompt now uses `activeChar.gender` ("a young man" / "a young woman") instead of generic "two people"
- User message changed from "🤝 Held hands" to "💕 Reaching out to hold [name]'s hand..."

### Homepage Continue Card — Most Recent Trip
- Active trips sorted by `startedAt` descending so most recent trip shows first
- Sets `activeTripId` on click so the correct trip loads

## Done Previous Sessions
- Globe UX overhaul (atmosphere, labels, arcs, overlay card, loading skeleton, ring pulses)
- Multi-trip support with compact trip rows
- Visitor social proof avatars on selected city card
- Sidebar icon consistency + twin-first homepage redesign
- Interactive globe on TravelHomePage (react-globe.gl)
- 30 destinations (7 unlocked, 23 coming soon) with Pencil-generated cover images
- Travel Mode fully built (Phases 1-5)
- Companion remix system — profile modals, custom companions, image upload + stylization
- StoriesHomePage with genre filters
- Multi-chapter infra, share CTA, pings, stories, feedback modal, mobile polish

## Next

### 1. Full browser playtest
- Test landmark photo feature end-to-end (mention a landmark, verify real photo appears)
- Test companion remix persistence (create remix, refresh, verify it persists)
- Test hold-hands image with male twin (verify correct gender in generated image)
- Test homepage continue card shows Kyoto (most recent) not Bangkok

### 2. GTM launch
- GTM-PLAYBOOK.md is ready — execute channel strategy
- 7 available destinations should be enough for launch
- Need screenshots from playtest for Reddit/Twitter posts

## Key Files
- `src/pages/HomePage.tsx` — twin-first homepage, continue cards sorted by recency
- `src/pages/TravelCityPage.tsx` — companion select + remix modal (uses store for customCompanions)
- `src/pages/TravelReaderPage.tsx` — travel chat, scene view, place photos, actions, vibe sliders
- `src/store/useStore.ts` — characters, trips, customCompanions, story progress, persist v9
- `src/lib/imageSearch.ts` — place image fetching + [PLACE:] tag parsing
- `src/lib/claude/travel.ts` — travel system prompts with [PLACE:] tag instructions
- `api/image-search.ts` — Vercel Edge Function for Wikipedia/Google image search
- `src/hooks/useGameStateSync.ts` — auto-sync to Supabase (includes customCompanions)
- `src/contexts/AuthContext.tsx` — sign-out save (includes customCompanions)

## Blockers
- None currently
