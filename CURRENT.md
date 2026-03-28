# Chaptr V2 — Current Session State

## In Progress
- Nothing active — all features implemented, pending Vercel deploy

## Done This Session
- `chapterBrief` arc guardrails — already implemented in both storyData.ts + claudeStream.ts
- `characterState` tracking — junhoTrust (0-100) in Zustand store, persisted, injected into system prompt
- Dynamic choice generation — `generateChoices()` in claudeStream.ts, fires after each prose stream, stores in `dynamicChoices`
- Scene images now change per beat — `continuationSceneImage` per chapter, swaps in after "Generating your scene..." spinner
- Selfie displayed in reader nav (mobile + desktop), YourStorySidebar, YourStorySheet
- Desktop landing hero fixed to match Pencil Screen-8 — Space Grotesk headline, corrected subtitle copy, rounded-xl button, 700px hero, dual overlay

## Next
- Deploy to Vercel: `npx vercel login` then `npx vercel --prod` from project root
- OR push to GitHub — auto-deploys if repo already linked

## Open Issues / Known Gaps
- Scene images are placeholder quality (V1 reuse) — real AI-generated scenes would require backend
- No Vercel deploy yet for V2 — still local + GitHub only

## Key Files
- `src/lib/claudeStream.ts` — streaming + system prompt (`buildSystemPrompt`)
- `src/data/storyData.ts` — chapter data, CHARACTER_BIBLE, add chapterBrief here
- `src/store/useStore.ts` — Zustand store (choices, gems, chapter progress)
- `src/pages/StoryReaderPage.tsx` — main reader, choice handling, streaming
- `src/pages/LandingPage.tsx` — full landing page (mobile + desktop)
- `public/` — hero-landing.jpeg, hero-desktop.jpeg, step1-3 images, scene images

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (direct SSE streaming)
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
