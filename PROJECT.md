# Chaptr V2

AI-powered interactive story app where you upload a selfie and become the main character.

## Status
V2 — Live at chaptr-v2.vercel.app. Multi-character system, 3 universes (Romance, Horror, Mystery), ambient audio, social sharing.

## Stack
React + Vite + TypeScript + Tailwind v3 + Zustand (persist v2, multi-character) + Framer Motion + Vaul + Anthropic Haiku (via Vercel Edge proxy) + Together AI FLUX (scenes/portraits/selfie stylization) + Supabase (analytics, playthroughs, share URLs)

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
Per-character affinity (0–100) stored as `characterAffinities` in progress. 5 tiers: Stranger → Acquaintance → Friend → Close → Confidant. `AffinityBadge` component shows tier label + fill bar. Tier injects `promptModifier` into all Claude calls. Grows every exchange via `getAffinityGrowth()`.

### F3 — Character-Initiated Messages (Pings)
Characters can message the protagonist between story steps. Definitions in `src/data/pings.ts`. `PingNotification` component renders notification + mini-chat drawer (Vaul sheet). Triggered on step transitions via `prevStepIndexRef`. Affinity-gated — characters only reach out above a threshold.

### F4 — Side Stories / Character Quests
Mini branching stories per character, defined in `src/data/quests.ts`. `QuestPage` renders beat + chat steps. `QuestUnlockToast` notifies on unlock. Quest summaries saved to `chatSummaries` with `quest:` prefix so they feed into main story context. Sidebar integration for discovery.

### F5 — Memory / Callback System
Characters remember personal facts the protagonist reveals. `extractMemories()` in `claudeStream.ts` — lightweight Claude call that parses 1–2 protagonist facts from a transcript as a JSON array. Extraction fires every 2nd exchange (fire-and-forget) across all 3 chat surfaces (ChatScene, SceneChat, FreeChatPage). Memories injected into every subsequent Claude call as "THINGS THE PROTAGONIST HAS SHARED WITH YOU". Capped at 10 memories per character.

### F6 — Group Chat Scenes
Unified message thread where multiple characters talk simultaneously. `GroupChatScene.tsx` component — round-robin character rotation per exchange, 30% chance of a brief AI-to-AI reaction from a second character (`generateGroupReaction()`). Activated by setting `groupChat: true` on any scene step in storyData. Memory extraction wired in.

## Key Files
- `src/store/useStore.ts` — Multi-character Zustand store, progress keyed by `characterId:universeId`
- `src/hooks/useActiveStory.ts` — Derived state hook (THE way to read character+progress)
- `src/lib/claudeStream.ts` — Streaming prose + chat + memory extraction + group reactions
- `src/lib/affinity.ts` — Tier definitions + growth formula
- `src/lib/ambientAudio.ts` — Web Audio API ambient pads (mood-based: story/chat/choice/reveal)
- `src/data/storyData.ts` — Story steps, character bibles, universe registry (`groupChat` flag on scene steps)
- `src/data/pings.ts` — Character-initiated message definitions
- `src/data/quests.ts` — Side story / quest definitions
- `src/pages/StoryReaderPage.tsx` — Main reader (beats, choices, chat, scene images, pings, quest toasts)
- `src/pages/FreeChatPage.tsx` — Post-story free chat (all characters, no limit)
- `src/pages/QuestPage.tsx` — Mini story reader for side quests
- `src/pages/CharacterSelectPage.tsx` — Character picker (max 3)
- `src/pages/CreateCharacterPage.tsx` — Character creation (name, gender, personality, selfie)
- `src/components/ChatScene.tsx` — Single-character chat
- `src/components/SceneChat.tsx` — Multi-character tabbed scene chat
- `src/components/GroupChatScene.tsx` — Unified group chat thread
- `src/components/PingNotification.tsx` — Character-initiated ping + mini-chat drawer
- `src/components/QuestUnlockToast.tsx` — Quest unlock notification
- `src/components/AffinityBadge.tsx` — Tier label + fill bar
- `src/components/ChoicePoint.tsx` — Choice UI component
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

## Open Issues / Next Priorities
1. Immersive choice UX — scene backdrop + consequence hints
2. Test full playthrough on Horror + Mystery universes
3. Cost modeling before scaling
4. Hero BG blurry on retina — needs 2x source
