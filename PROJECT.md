# Chaptr V2

AI-powered interactive story app where you upload a selfie and become the main character.

## Status
V2 — Feature-complete locally. Deployed at chaptr-v2.vercel.app (Vercel, auto-deploy from GitHub master).

## Stack
React + Vite + TypeScript + Tailwind v3 + Zustand (persist, `chaptr-v2` localStorage key) + Framer Motion + Vaul + Anthropic Haiku (direct SSE streaming). No Supabase — localStorage only.

## Core Loop
Upload selfie → Choose universe → Read AI-generated story → Make choices that affect narrative and character trust → Gem-gated scene reveals.

## Live URL
https://chaptr-v2.vercel.app

## GitHub
https://github.com/cloudatreides/chaptrV2

## Key Files
- `src/lib/claudeStream.ts` — streaming prose + choice generation, system prompt builder
- `src/data/storyData.ts` — chapter data, CHARACTER_BIBLE, scene images
- `src/store/useStore.ts` — Zustand store (selfieUrl, gems, junhoTrust, chapter progress)
- `src/pages/StoryReaderPage.tsx` — main reader, choices, streaming, scene images
- `src/pages/UniversesPage.tsx` — story browser with genre filters
- `src/pages/LandingPage.tsx` — full landing page (mobile + desktop)
- `api/` — Vercel serverless functions (to be added for image generation proxy)

## Differentiators vs Simmy
- Web-based (Simmy is iOS only)
- Multi-genre: Romance, Horror, Mystery, Adventure (Simmy is romance-only)
- Dynamic AI-generated choices via Claude (Simmy uses 4 static pre-written options)
- No celebrity likenesses — original character archetypes only (legally safe)

## Open Issues / Next Priorities
1. Selfie-in-scene photo generation (P0 — core promise undelivered)
2. Onboarding order is wrong — selfie gate should be before play, not before browsing
3. Loading state needs to be theatrical, not just a spinner
4. junhoTrust is tracked but invisible — needs relationship UI
5. No bio/personality selection before play
6. No share mechanic / viral loop
