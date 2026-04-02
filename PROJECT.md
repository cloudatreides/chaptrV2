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

## Key Files
- `src/store/useStore.ts` — Multi-character Zustand store, progress keyed by `characterId:universeId`
- `src/hooks/useActiveStory.ts` — Derived state hook (THE way to read character+progress)
- `src/lib/claudeStream.ts` — Streaming prose + chat + choice generation, system prompts
- `src/lib/ambientAudio.ts` — Web Audio API ambient pads (mood-based: story/chat/choice/reveal)
- `src/data/storyData.ts` — Story steps, character bibles, universe registry
- `src/pages/StoryReaderPage.tsx` — Main reader (beats, choices, chat, scene images)
- `src/pages/CharacterSelectPage.tsx` — Character picker (max 3)
- `src/pages/CreateCharacterPage.tsx` — Character creation (name, gender, personality, selfie)
- `src/components/ChoicePoint.tsx` — Choice UI component
- `src/components/ChatScene.tsx` — Chat with story characters
- `api/claude.ts` + `api/together.ts` — Vercel Edge API proxies
- `api/og.tsx` + `api/share.ts` — OG image + share HTML

## Differentiators vs Simmy
- Web-based (Simmy is iOS only)
- Multi-genre: Romance, Horror, Mystery (Simmy is romance-only)
- Multi-character: up to 3 characters with independent progress per universe
- Dynamic AI-generated choices via Claude (Simmy uses 4 static pre-written options)
- No celebrity likenesses — original character archetypes only (legally safe)

## Open Issues / Next Priorities
1. Immersive choice UX — scene backdrop + consequence hints (next task)
2. Test full playthrough on Horror + Mystery universes
3. Cost modeling before scaling
4. Hero BG blurry on retina — needs 2x source
