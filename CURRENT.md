# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress

## Done This Session

### includesProtagonist Cost Optimization
- Added `includesProtagonist` field to `StoryStep` interface in `src/data/storyData.ts`
- Wired through in `StoryReaderPage.tsx` — scenes tagged `includesProtagonist: false` use Schnell ($0.04) instead of Kontext Pro ($0.20) even when selfie exists
- Tagged 34 non-protagonist scenes across all 15 universes (2 in Seoul Transfer, 32 across 11 other story files)
- Saves ~$1.50/playthrough for users with selfies

### Prompt-Hash Image Caching (Supabase)
- Added SHA-256 prompt hashing + Supabase cache layer in `src/lib/togetherAi.ts`
- Schnell-generated scenes are cached by prompt+dimensions hash — identical prompts return cached URL instead of regenerating
- Kontext (personalized selfie) scenes are NOT cached (unique per user)
- **Requires Supabase table**: Run this SQL in Supabase dashboard:
  ```sql
  CREATE TABLE chaptr_image_cache (
    prompt_hash TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    prompt_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE chaptr_image_cache ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public read/write for image cache" ON chaptr_image_cache FOR ALL USING (true) WITH CHECK (true);
  ```

### previousPlaythroughs — Already Wired
- Verified: `playthroughHistory` is already passed to `streamBeatProse` (StoryReaderPage:251)
- `addPlaythroughRecord` called in RevealPage on story completion
- `buildMemoryPrompt` in claudeStream.ts injects previous choices + signatures into beat prompts

### Code Path Verification (Full Playthrough)
- Premium choice flow: `spendGems` gated, tracked via analytics
- Community stats: shown after choice with 3.5s delay, auto-dismiss
- Cross-story memory: playthrough records saved, injected into beat generation
- Ambient pings: triggered on step transitions, affinity-gated
- Cast unlock: fires on chat/scene step entry

### Mobile Polish — Verified
- All pages use `md:` breakpoints with separate mobile/desktop views
- Safe area insets (`safe-top`, `safe-bottom`) on key pages
- `dvh`/`svh` viewport units for full-height layouts
- No hardcoded desktop offsets (no `w-[220px]` or `left-[220px]` patterns)
- Horizontal scrollable sections use `overflow-x-auto scrollbar-none`

## What's Built So Far

### Universe Expansion (15 total)
- **6 genres**: Romance (4), Horror (3), Mystery (3), Adventure (3), Thriller (1), Fantasy (1)
- Each universe has full branching story data (~18-25 steps), 2 NPCs with system prompts, character bible, card art
- Genre filter pills on Universes page (All, Romance, Horror, Mystery, Adventure, Thriller, Fantasy)
- Mock player counts on HomePage cards

### Auth Modal
- Landing page CTA buttons ("Start Your Story", "Start Reading") show an in-page auth modal for logged-out users instead of full-page OAuth redirect
- `src/components/AuthModal.tsx` — modal with Google sign-in, Chaptr branding, terms/privacy links

### Twin Renaming
- All user-facing "Character" labels renamed to "Twin" (CharacterSelectPage, CreateCharacterPage, EditCharacterPage)
- Creating a new twin navigates back to `/characters` instead of straight into `/story`
- CharacterSelectPage subtext: "Choose which version of you steps into the story."

### Cast Chat System (complete)
- **Store v6** — `castChatThreads`, `unlockedCastIds`, `groupCastThreads`, `favoriteCastIds`
- **Cast Roster** (`src/data/castRoster.ts`) — 11-character roster (3 base + 8 story-locked) with bios, unlock hints, universe colors
- **AI Portraits** — All 11 characters have FLUX-generated static portraits in `public/`
- **CastPage** (`/cast`) — Full roster grid, group chat section, favorites, mobile + desktop
- **CastChatPage** (`/cast/:id`) — Persistent chat with streaming, memory extraction, affinity growth
- **Group Chat** (`/cast/group/:ids`) — 2-3 same-universe characters, persistent threads, accessible from CastPage
- **AppSidebar** — Desktop nav with logo, nav items, favorites section, logout

### Landing Page
- Desktop + mobile responsive
- Hero with AI image, typewriter headline, gradient overlays
- How It Works — 3 step cards with scene images and interactive widgets
- Features — cards with manhwa preview images, social proof testimonials, dramatic CTA
- Footer with links

## Next
- Create `chaptr_image_cache` table in Supabase (SQL above)
- Debug scene image generation for newer universes (check Together AI API response in browser devtools)
- Consider adding `includesProtagonist: false` to chat scene intro images (ChatScene.tsx, SceneChat.tsx) for NPC-only intro shots

## Blockers
- Image cache won't work until Supabase table is created

## Key Files
- `src/data/storyData.ts` — 15 universe definitions, genre filters, `includesProtagonist` field on StoryStep
- `src/data/stories/*.ts` — 14 universe-specific story files + index registry
- `src/lib/togetherAi.ts` — scene generation with prompt-hash caching + includesProtagonist routing
- `src/lib/claudeStream.ts` — streaming prose/chat with cross-playthrough memory
- `src/store/useStore.ts` — v6 with all state management
- `src/pages/StoryReaderPage.tsx` — story reader with all flow wiring
- `src/components/AuthModal.tsx` — auth login modal
- `src/data/castRoster.ts` — 11-character roster
- `src/pages/HomePage.tsx` — CastSection, universe cards with player counts
- `src/pages/CastPage.tsx` — full cast browser with group chats + favorites
- Pencil: `C:/Users/ASUS/Downloads/chaptr.pen` — wireframes at bottom of canvas

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
