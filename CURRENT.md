# Chaptr V2 — Current Session State

## In Progress
- Adding `chapterBrief` arc guardrails to Claude system prompt (narrative arc fix)

## Done This Session
- Full V2 prototype built from Pencil wireframes — React + Vite + TS + Tailwind + Zustand + Framer Motion + Vaul
- Routes: / (landing) → /upload → /universes → /story
- Mobile landing: full scrollable (hero → how it works → testimonials → footer)
- Desktop landing: Pencil YwiY2 layout — centered hero, Playfair Display, nav links, 3-col steps with exported images, 3-col testimonials, proper footer
- Hero images exported directly from Pencil (.pen) — hero-landing.jpeg (mobile portrait) + hero-desktop.jpeg (landscape)
- Step images exported from Pencil — step1-upload.jpeg, step2-world.jpeg, step3-story.jpeg
- Mobile gradient fixed — scene/silhouettes visible, only bottom 25% darkens
- Pushed to: https://github.com/cloudatreides/chaptrV2

## Next
- Add `chapterBrief` to `storyData.ts` — 3-sentence arc destination per chapter
- Inject `chapterBrief` into `buildSystemPrompt()` in `claudeStream.ts`
- This prevents arc drift after Ch.2 without any architectural change

## Open Issues / Known Gaps
- No `characterState` object yet (trust/relationship tracking) — needed for deep causal persistence
- Dynamic choice generation not implemented — choices are hardcoded (fine for PoC)
- Scene images for story reader are reused from V1 (placeholder quality)
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
