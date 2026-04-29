# Chaptr V2

AI-powered interactive story app where you upload a selfie and become the main character.

## Status
V2 — Live at chaptr-v2.vercel.app. 15 universes across 6 genres, 29 cast characters with AI portraits, cast chat system, ambient audio, social sharing.

## Stack
React + Vite + TypeScript + Tailwind v3 + Zustand (persist v9, multi-character) + Framer Motion + Vaul + Anthropic Haiku (via Vercel Edge proxy) + Together AI FLUX (scenes/portraits/selfie stylization) + Google Gemini (Nano Banana 2 / Pro / 2.5 — under evaluation) + Supabase (analytics, playthroughs, share URLs, per-user game state sync, sync-error telemetry, image cache)

## Core Loop
Choose universe → Create character (name, gender, personality, optional selfie) → Read AI-generated story → Make choices that affect narrative and trust → Chat with characters → Gem-gated scene reveals → Share result.

## Live URL
https://chaptr-v2.vercel.app

## GitHub
https://github.com/cloudatreides/chaptrV2

## Features Built (V2)

### F1 — Free Chat Mode
Post-story mode at `/free-chat`. All universe characters available as tabs. Full playthrough context injected (choices, summaries, trust, reveal signature). No exchange limit.

### F2 — Affinity System
Per-character affinity (0–100) stored as `characterAffinities` in progress. 5 tiers: Stranger → Acquaintance → Friend → Close → Confidant. `AffinityBadge` component shows tier label + fill bar (used in sidebar + free chat, removed from story chat headers to avoid duplication). Tier injects `promptModifier` into all Claude calls. AI responses include `[AFFINITY:+N]` tags (stripped before display) that adjust score dynamically based on conversation quality (-5 to +5 per exchange).

### F3 — Character-Initiated Messages (Pings)
Characters can message the protagonist between story steps. Definitions in `src/data/pings.ts`. `PingNotification` component renders notification + mini-chat drawer (Vaul sheet). Triggered on step transitions via `prevStepIndexRef`. Affinity-gated — characters only reach out above a threshold.

### F4 — Side Stories / Character Quests
Mini branching stories per character, defined in `src/data/quests.ts`. `QuestPage` renders beat + chat steps. `QuestUnlockToast` notifies on unlock. Quest summaries saved to `chatSummaries` with `quest:` prefix so they feed into main story context. Sidebar integration for discovery.

### F5 — Memory / Callback System
Characters remember personal facts the protagonist reveals. `extractMemories()` in `claudeStream.ts` — lightweight Claude call that parses 1–2 protagonist facts from a transcript as a JSON array. Extraction fires every 2nd exchange (fire-and-forget) across all 3 chat surfaces (ChatScene, SceneChat, FreeChatPage). Memories injected into every subsequent Claude call as "THINGS THE PROTAGONIST HAS SHARED WITH YOU". Capped at 10 memories per character.

### F6 — Group Chat Scenes
Unified message thread where multiple characters talk simultaneously. `GroupChatScene.tsx` component — round-robin character rotation per exchange, 30% chance of a brief AI-to-AI reaction from a second character (`generateGroupReaction()`). Activated by setting `groupChat: true` on any scene step in storyData. Memory extraction wired in.

## Key Files
- `src/store/useStore.ts` — Multi-character Zustand store v9, progress keyed by `characterId:universeId`
- `src/lib/gameStateSync.ts` — Per-user game state sync with retry, error classification, and telemetry
- `src/hooks/useActiveStory.ts` — Derived state hook (THE way to read character+progress)
- `src/lib/claudeStream.ts` — Streaming prose + chat + memory extraction + group reactions
- `src/lib/togetherAi.ts` — Scene generation with prompt-hash caching, includesProtagonist routing, absolute-URL coercion for refs
- `src/lib/nanoBanana.ts` — Gemini image-gen client wrapper (under evaluation vs FLUX)
- `src/lib/supabase.ts` — Supabase client + `uploadImageToStorage` (returns durable or null, never ephemeral)
- `src/lib/affinity.ts` — Tier definitions + growth formula
- `src/lib/ambientAudio.ts` — Web Audio API ambient pads (mood-based: story/chat/choice/reveal)
- `src/contexts/AuthContext.tsx` — Auth + cloud hydrate (prefers local on hydrate; force-reload on user mismatch)
- `src/data/storyData.ts` — Story steps, universe registry, `includesProtagonist` flag
- `src/data/stories/*.ts` — 14 universe-specific story files
- `src/data/castRoster.ts` — 11-character roster with bios, unlock hints
- `src/data/chatActions.ts` — Chat action definitions + reaction prompt builder
- `src/pages/StoryReaderPage.tsx` — Main reader (beats, choices, chat, scene images, pings, quest toasts)
- `src/pages/AccountPage.tsx` — My Account with editable name, stats
- `src/pages/UniverseDetailPage.tsx` — Universe detail view
- `src/pages/HomePage.tsx` — Home with FTUE, universe cards, cast section, sync indicator
- `src/pages/CastPage.tsx` — Full cast browser with group chats + favorites
- `src/pages/LandingPage.tsx` — Public landing page
- `src/pages/AdminImageBenchPage.tsx` — Image bench + image-gen actions audit (admin)
- `src/pages/CreateCharacterPage.tsx` — Twin create + edit; "Photo expired" banner; auto-set-active on save
- `src/components/AppSidebar.tsx` — Desktop nav with favorites, stacked avatars, account link
- `src/components/SyncIndicator.tsx` — Top-right sync status pill on home
- `src/components/travel/DepartureScreen.tsx` — Travel start; reliable two-character scene with ref-image binding
- `api/claude.ts` + `api/together.ts` + `api/nano-banana.ts` — Vercel Edge API proxies
- `api/log-sync-error.ts` — Server-side sync error telemetry (uses service-role key)
- `api/og.tsx` + `api/share.ts` — OG image + share HTML
- `supabase/migrations/004_sync_errors.sql` — Sync error telemetry table

## Differentiators vs Simmy
- Web-based (Simmy is iOS only)
- Multi-genre: Romance, Horror, Mystery (Simmy is romance-only)
- Multi-character: up to 3 characters with independent progress per universe
- Dynamic AI-generated choices via Claude (Simmy uses 4 static pre-written options)
- No celebrity likenesses — original character archetypes only (legally safe)

## Landing Page (latest)
- **Hero (desktop)**: Two-column layout — text + CTA left, animated chat demo right. Background silhouettes visible through center.
- **Hero (mobile)**: Single column, chat demo below headline.
- **Chat demo image**: Shows `sora-portrait.png` (Sora's actual portrait) instead of a generic scene image.
- **Step 1 widget (SelfieMorph)**: Morphs between real photo (`step1-selfie.jpeg`) and AI-generated anime version (`step1-anime.png`). Labels swap: "selfie" → "anime".
- **Step 2 widget (StoryUniverses)**: Crossfades between Seoul Transfer, Hollow Manor, The Last Signal with genre tag badges, story title, and animated dot indicators. Step titled "Pick your world".
- **Step 3 widget (ChoiceCards)**: Two in-game-styled choice cards that alternate highlighting — matches actual game choice UI. Replaces the previous sparse SVG branch animation.

## ChatScene
- **Intro image**: Generated scene via Together AI (FLUX.1 Kontext Pro if selfieUrl available, FLUX.1 Schnell otherwise). Uses character's `introImagePrompt` or `chatImagePrompt`.
- **Schnell uses `aspect_ratio`** (not `width`/`height`) per Together AI API change. Kontext Pro still uses `width`/`height`.

### F7 — Chat Actions
Interactive actions in all 6 chat surfaces. 11 actions across 4 categories (Playful, Gifts, Emotional, Romantic). Gender-adaptive variants, affinity tier-gating, gem economy. Key features:
- **Send a Meme**: Genre-aware meme pool, random pick shown in bubble, character reacts to specific meme
- **Dare**: Player dares the character from genre-aware pool, character must perform it
- **Coffee**: Generates Kontext scene image of protagonist handing coffee to character (uses selfie reference)
- **Serenade**: Generates Kontext scene image of protagonist singing to character
- **Love Letter**: Async AI-generated letter content, character reacts emotionally
- **Mystery Box**: Random affinity boost (1-8), reaction portrait generated
- **Comfort**: Character reaction portrait generated
- Master account (nicholas@zentry.com) has infinite gems and all tiers unlocked for playtesting.

### F8 — Per-User Game State Sync
Full store state (chat threads, affinities, gems, progress, unlocks) synced to Supabase `user_game_state` table. Debounced auto-save on changes, cloud hydration on login, save-before-logout. Data survives logout/login cycles.

### F9 — Genre-Aware Story Moments
Selfie capture moments adapt per genre. Romance = "Album" with selfie photo style. Thriller = "Dossier" with surveillance aesthetic. Horror = "Evidence" with polaroid style. Mystery = "Case Files", Fantasy = "Memories", Adventure = "Journal". Config in `getMomentConfig()` drives all copy: capture spinner, save prompt, button text, album title, empty state, note placeholders, image generation style.

### F10 — Image Bench (Admin Tool)
Internal A/B testing tool at `/admin/image-bench` (ProtectedRoute, master-mode only). Two tabs:

- **Bench**: side-by-side comparison of 6 image-gen models (FLUX.2 Pro, Kontext Pro, Schnell, Nano Banana 2/Pro/regular). Same prompt + references run through every model. Per-tile latency + cost-per-image + projected $ at 1k images. Twin-debug panel lists every twin with URL classification (SUPABASE / DATA URL / DEAD / NO SELFIE). "Reset twins only" recovery button.
- **Audit (16 entries)**: source-of-truth doc for every image-gen call site. Categorized by Twin / Travel / Story / Chat reaction / Cast. Each entry shows feature + trigger + file:line + model tier + reference requirements + verbatim prompt + notes. "Load into bench" button drops a prompt into the bench tab for one-click cross-model testing.

### F11 — Sync Resilience (3 Layers)
After cross-session twin loss bug. Now hardened:

1. **Visible sync indicator** (`SyncIndicator.tsx`) — top-right pill showing `Saving...` / `Saved` / `Save failed` in real time. Click red pill to expand actual error. No more silent data loss.
2. **Auto-retry with exponential backoff** — 4 attempts at 2s/5s/15s/60s. `classifyError()` splits transient (auth, network, timeouts) from permanent (RLS, schema, payload-too-large) failures.
3. **Server-side telemetry** — `/api/log-sync-error` Edge endpoint uses `SUPABASE_SERVICE_ROLE_KEY` to write to `sync_errors` table (RLS-bypassing, since the point is to capture errors RLS itself might cause). Aggregated SQL queries for failure rate, top error codes, payload size distribution baked into the migration as comments.

Also fixed in this layer:
- `hydrateFromCloud` — drop timestamp comparison, prefer local whenever local has data (cloud only wins on truly fresh device). Old logic silently overwrote local with stale cloud state on every refresh.
- Sync debounce 5s → 1.5s. `beforeunload` + `pagehide` flush handlers for tab close.
- `travelTrips` and `activeTripId` added to cloud sync (were silently localStorage-only, lost on every logout).
- Cross-email contamination fix — `getSession` force-reloads on user mismatch (matching `onAuthStateChange`).
- `uploadImageToStorage` no longer falls back to ephemeral URLs on failure — returns `null` or a `data:` URL instead. Stops dead URLs from leaking into persistent storage (`storyMoments`, `travelTrips.sceneImages`, `chaptr_image_cache`).

## Open Issues / Next Priorities
1. **Decide FLUX vs Gemini for prod image gen** — bench at `/admin/image-bench` set up. Run audit-tab entries (selfie, hold-hands, gift) through all 6 models. Gemini 3.1 Flash visibly winning identity match in early tests. Decision blocks GTM image-quality story.
2. Mobile polish on universe detail pages
3. Playtest all genre-aware content (memes, dares, moments) across non-romance genres
4. **Multi-device sync conflict resolution** (post-GTM) — current strategy is prefer-local, can clobber a Device-A change if Device-B opens with stale state. Acceptable for solo testing, needs proper merge logic before launch with multi-device users.

## Required Env Vars (Vercel)
- `TOGETHER_API_KEY` — image gen
- `ANTHROPIC_API_KEY` — Claude
- `GEMINI_API_KEY` — Nano Banana / Gemini image gen
- `SUPABASE_SERVICE_ROLE_KEY` — server-side telemetry (`/api/log-sync-error`)
