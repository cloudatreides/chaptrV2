# Chaptr V2 — Current Session State

## In Progress
- Character Chat feature (c.ai-style NPC chat hub) — partially built

## What's Built So Far

### Store v4
- `castChatThreads: Record<string, CastChatMessage[]>` — persistent per-NPC chat threads (capped at 100 msgs)
- `unlockedCastIds: string[]` — tracks which NPCs are chattable. Base chars (sora, jiwon, yuna) pre-populated
- `addCastChatMessage()`, `unlockCastCharacter()` actions
- Migration from v3 → v4 in place

### Cast Roster Data (`src/data/castRoster.ts`)
- Full 10-character roster: 3 base + 8 story-locked
- Base: sora, jiwon, yuna (Seoul Transfer)
- Locked: ren, mei (Sakura Academy), ellis, mae (Hollow Manor), dex, noor (The Last Signal), zara, kael (Edge of Atlas)
- `UNIVERSE_COLORS` for color-coded lock hints
- `getCastCharacter()` helper (universe-aware)

### Routes
- `/cast` → `CastPage` (full roster grid)
- `/cast/:characterId` → `CastChatPage` (persistent chat thread)
- Both wired in `App.tsx` with `<ProtectedRoute>`

### CastPage (`src/pages/CastPage.tsx`)
- Mobile: grid of unlocked characters (avatar, name, universe, affinity badge, last message preview) + locked grid (lock icon, "Play [Universe]" hint)
- Desktop: horizontal cards for unlocked + row of locked characters
- Matches Pencil wireframes

### CastChatPage (`src/pages/CastChatPage.tsx`)
- Persistent chat thread with streaming via `streamChatReply`
- Character header with avatar, name, affinity badge, universe label
- Message bubbles: NPC left (dark), user right (gradient)
- Typing indicator (bouncing dots)
- Memory extraction every 2nd exchange (fire-and-forget)
- Memory toast ("Sora remembered: you like film photography")
- Affinity growth per exchange via `getAffinityGrowth()`
- Global affinity updates (carries into stories)
- Collects memories from ALL playthroughs for context injection
- Redirect if character not unlocked

### HomePage Renames
- "Your Characters" → "Your Twins"
- "Relationships" → "Characters To Meet" (label + component renamed to `CastSection`)
- "Create Character" → "Create Twin"

### Pencil Wireframes (in chaptr.pen)
- 6 screens designed: 3 mobile (390px) + 3 desktop (1440px)
- Homepage, /cast roster, /cast/:id chat — all at bottom of canvas

## Remaining — Next Session

1. **HomePage Cast Section upgrade** — the "Characters To Meet" section still uses the old `relationships` data (globalAffinities). Upgrade to use `CAST_ROSTER` + `unlockedCastIds`, make avatars tappable to `/cast/:id`, add locked silhouettes, add "Explore All Cast →" link to `/cast`
2. **Wire unlock triggers in StoryReaderPage** — call `unlockCastCharacter(characterId)` when player first encounters/chats with an NPC in-story (in ChatScene, SceneChat, GroupChatScene)
3. **Test full flow** — create character → play story → unlock NPC → navigate to /cast → chat persistently
4. **Desktop CastChatPage** — currently mobile-only layout, needs desktop two-column layout (chat + profile sidebar with memories) matching Pencil wireframe

## Backlog (from previous sessions)
1. Wire `previousPlaythroughs` to `streamBeatProse` — StoryReaderPage beat generation doesn't pass playthrough history to Claude yet
2. Tag `includesProtagonist: false` on scene prompts — saves ~$1.50/playthrough
3. Test full playthroughs — verify premium choice flow, community stats, cross-story memory, ambient pings
4. Cost optimization phase 2 — prompt-hash image caching in Supabase

## Done This Session (2026-04-07)
- Designed 6 Pencil wireframes for character chat feature (3 mobile + 3 desktop)
- Renamed "Your Cast" → "Characters To Meet" across all wireframes
- Built store v4 with castChatThreads, unlockedCastIds, migration
- Created cast roster data (10 characters, universe mapping)
- Built CastPage (full roster grid, mobile + desktop)
- Built CastChatPage (persistent chat with streaming, memory, affinity)
- Renamed HomePage sections (Twins/Cast/Create Twin)
- Wired routes in App.tsx

## Done Previous Sessions
- Wireframed and brainstormed character chat feature
- Git push, QA + Design Review, Character edit page, Immersive choice UX
- Story data validation (5 universes, 20 paths, zero broken refs)
- Cost model ($3.52/playthrough), Schnell fallback, Retina hero fix
- Cross-story global affinity, story memory, ambient pings, shareable moments
- Community stats, gem-gated premium choices, HomePage relationships section
- Store v3 migration

## Blockers
- None

## Key Files
- `src/store/useStore.ts` — v4 with castChatThreads, unlockedCastIds
- `src/data/castRoster.ts` — full 10-character roster definition
- `src/pages/CastPage.tsx` — /cast roster grid
- `src/pages/CastChatPage.tsx` — /cast/:id persistent chat
- `src/pages/HomePage.tsx` — renamed sections, CastSection needs upgrade
- `src/pages/StoryReaderPage.tsx` — needs unlock triggers wired
- `src/data/characters.ts` — base characters (Sora, Jiwon, Yuna)
- `src/data/stories/*.ts` — universe-specific characters
- `src/lib/claudeStream.ts` — streamChatReply, extractMemories (reused for cast chat)
- Pencil: `C:/Users/ASUS/Downloads/chaptr.pen` — wireframes at bottom of canvas

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
