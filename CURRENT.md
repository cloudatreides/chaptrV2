# Chaptr V2 — Current Session State

## In Progress
- Landing page polish — features section ("Stories that respond to you") + CTA block look too plain, need visual treatment

## Done This Session
- **Review: found & fixed hardcoded Seoul context** — storyContext was "Seoul Transfer" for ALL universes, breaking LLM context for Sakura Academy, Hollow Manor, Edge of Atlas, The Last Signal. Now derives from selected universe.
- **Fixed genre filter mismatch** — Edge of Atlas had `genre: 'EPIC ADVENTURE'` but filter was `'ADVENTURE'`. Universe was hidden when filtering.
- **Landing page tailored for female audience (teenage girls)**:
  - Chat demo swapped from Sora (female) to Jiwon (male lead)
  - Dialogue rewritten: warm + intriguing (not cold/guarded)
  - Mood stages: "guarded, warming up" (matches Jiwon's character)
  - Choice card: "Trust him" instead of "Trust her"
  - Selfie morph: replaced male selfie with female photo
  - Generated anime version matching selfie pose (looking down at camera, black top, jade pendant)
  - Generated Jiwon portrait for chat demo avatar
- **Trust badges fixed** — removed "Sign in with Google · 5 min experience", replaced with "No downloads · New story every time"
- **Selfie morph bg position** — shifted from bg-center to center 20% so face is visible
- **Em dash removed** from step 1 description
- **gstack upgraded** to v0.15.11.0

## Next
1. **Landing page features section needs design polish** — "Stories that respond to you" area with 3 feature cards + "Your story is waiting" CTA block look too plain. Needs background accents, gradients, or imagery to match the quality of the hero section above.
2. Also remove "Takes about 5 minutes" from the CTA block — same issue as the old trust badges
3. Immersive choice UX — scene backdrop + consequence hints
4. Test full playthrough on Horror + Mystery + new universes (Sakura Academy, Edge of Atlas)
5. Cost modeling before scaling
6. Hero BG blurry on retina — needs 2x source

## Key Assets Changed
- `public/step1-selfie.jpeg` — female selfie (replaced male)
- `public/step1-anime.png` — anime version matching selfie pose
- `public/jiwon-portrait.png` — Jiwon portrait for landing chat demo

## Key Files
- `src/pages/LandingPage.tsx` — landing page (Jiwon chat demo, selfie morph, features section)
- `src/pages/StoryReaderPage.tsx` — main reader (dynamic storyContext per universe)
- `src/data/storyData.ts` — universe registry, genre filter fix
- `src/data/stories/index.ts` — story registry (4 universes)
- `src/store/useStore.ts` — multi-character Zustand store
- `src/contexts/AuthContext.tsx` — Supabase auth session

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
