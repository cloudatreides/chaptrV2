# Chaptr V2

AI-powered interactive story app where you upload a selfie and become the main character.

## Status
V2 — Live at chaptr-v2.vercel.app. 15 universes across 6 genres, 29 cast characters with AI portraits, cast chat system, ambient audio, social sharing.

## Stack
React + Vite + TypeScript + Tailwind v3 + Zustand (persist v2, multi-character) + Framer Motion + Vaul + Anthropic Haiku (via Vercel Edge proxy) + Together AI FLUX (scenes/portraits/selfie stylization) + Supabase (analytics, playthroughs, share URLs, per-user game state sync)

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
- `src/store/useStore.ts` — Multi-character Zustand store v7, progress keyed by `characterId:universeId`
- `src/lib/gameStateSync.ts` — Per-user game state sync to Supabase (debounced auto-save + cloud hydration)
- `src/hooks/useActiveStory.ts` — Derived state hook (THE way to read character+progress)
- `src/lib/claudeStream.ts` — Streaming prose + chat + memory extraction + group reactions
- `src/lib/togetherAi.ts` — Scene generation with prompt-hash caching, includesProtagonist routing, aspect_ratio
- `src/lib/affinity.ts` — Tier definitions + growth formula
- `src/lib/ambientAudio.ts` — Web Audio API ambient pads (mood-based: story/chat/choice/reveal)
- `src/data/storyData.ts` — Story steps, universe registry, `includesProtagonist` flag
- `src/data/stories/*.ts` — 14 universe-specific story files
- `src/data/castRoster.ts` — 11-character roster with bios, unlock hints
- `src/pages/StoryReaderPage.tsx` — Main reader (beats, choices, chat, scene images, pings, quest toasts)
- `src/pages/AccountPage.tsx` — My Account with editable name, stats
- `src/pages/UniverseDetailPage.tsx` — Universe detail view
- `src/pages/HomePage.tsx` — Home with FTUE, universe cards, cast section
- `src/pages/CastPage.tsx` — Full cast browser with group chats + favorites
- `src/pages/LandingPage.tsx` — Public landing page
- `src/components/AppSidebar.tsx` — Desktop nav with favorites, stacked avatars, account link
- `api/claude.ts` + `api/together.ts` — Vercel Edge API proxies
- `api/og.tsx` + `api/share.ts` — OG image + share HTML

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
Interactive actions in all 6 chat surfaces. 13 actions across 4 categories (Playful, Gifts, Emotional, Romantic). Gender-adaptive variants, affinity tier-gating, gem economy, memory-system payoff loop. Letter writing for romantic actions. AI-generated reaction portraits for high-tier romantic actions.

### F8 — Per-User Game State Sync
Full store state (chat threads, affinities, gems, progress, unlocks) synced to Supabase `user_game_state` table. Debounced auto-save on changes, cloud hydration on login, save-before-logout. Data survives logout/login cycles.

## Open Issues / Next Priorities
1. Restore affinity tier-gating on actions (currently unlocked for testing)
2. Test full playthrough on newer universes (scene images, branching, cast unlocks)
3. Cost modeling before scaling
4. Mobile polish on universe detail pages
