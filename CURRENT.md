# Chaptr V2 — Current Session State

## In Progress
- Nothing active

## Done This Session
- `characterState` (junhoTrust 0-100) — Zustand store, persisted, injected into Claude system prompt
- Dynamic choice generation — `generateChoices()` fires after each prose stream, Claude generates contextual next choices
- Scene images swap per beat — `continuationSceneImage` per chapter, transitions after spinner
- Selfie avatar — reader nav (mobile + desktop), YourStorySidebar, YourStorySheet
- Desktop landing hero — correct image (Hero BG.png / umbrella Seoul illustration), bg-center, radial scrim, white/90 subtitle with text-shadow
- Landing nav links wired — Features/How It Works scroll to #how-it-works, Testimonials to #testimonials
- Footer — 2026 Chaptr / Made by Cloud Labs
- Upload + Universes pages — removed page-container override, now max-w-[520px] centered on desktop
- Story reader desktop — split layout: scene image top 45vh, dark prose panel scrollable below
- Universe placeholders — Hollow Manor (Horror), The Last Signal (Mystery), Edge of Atlas (Adventure) — all SOON locked
- Deployed to Vercel + GitHub auto-deploy connected: https://chaptr-v2.vercel.app

## Next
- Fix markdown rendering in story prose — Claude occasionally returns `# Chapter X` headers in beat responses. Fix: strip markdown in claudeStream.ts before yielding chunks
- Desktop hero blur — image is 1440×700px, blurry on retina. Fix: provide 2880×1400 version of Hero BG.png and swap in
- Verify dynamic choices end-to-end — generateChoices fires after stream but needs testing on beats 2+

## Open Issues / Known Gaps
- Scene images are reused V1 placeholders — real per-beat images need AI generation backend
- Markdown leaking into prose output occasionally
- Hero BG blurry on retina displays — needs 2x source image

## Key Files
- `src/lib/claudeStream.ts` — streaming + system prompt + generateChoices()
- `src/data/storyData.ts` — chapter data, CHARACTER_BIBLE, CHAPTER_BRIEFS, UNIVERSES
- `src/store/useStore.ts` — Zustand store (choices, gems, characterState, dynamicChoices)
- `src/pages/StoryReaderPage.tsx` — main reader, choice handling, streaming, scene swap
- `src/pages/LandingPage.tsx` — full landing page (mobile + desktop)
- `public/hero-desktop.png` — desktop hero background (umbrella Seoul illustration)

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (direct SSE streaming)
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
