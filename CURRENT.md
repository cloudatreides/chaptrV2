# Chaptr V2 — Current Session State

## In Progress
- Nothing active

## Done This Session
- Google Auth via Supabase (LoginPage, AuthContext, ProtectedRoute)
- Fixed Supabase project URL → now points to tbrnfiixertryutrijau (Chaptr project)
- Landing page public, CTAs trigger Google sign-in or navigate if already authed
- Auth redirects to /universes after login (AuthContext.tsx)
- Terms + Privacy pages added (/terms, /privacy)
- Fixed all pre-existing TS build errors blocking Vercel deploy
- Mood stage heartbeat animation (active stage pulses) + hover tooltips on all stages
- Suggestion chips now send immediately on click (no fill-then-submit)
- Choice card redesign: 160px images, text overlay, fallback avatar initials
- Trust indicator: added ♥ icon + italic label (was confused for image carousel)
- Beat-1 scene prompt fixed: now uses elevator prompt (not arrival)
- Selfie reference restored in scene generation (user character appears in scenes)
- Missing public assets committed (sora-portrait.png, step1-anime.png, step1-selfie.jpeg)
- TermsPage + PrivacyPage created (were blocking Vercel build)
- **Scene image carousel — COMPLETE**
  - All 9 beats now use `sceneImagePrompts: [primary, alt]` arrays
  - Generation logic updated: each prompt stored as `${stepId}:0`, `${stepId}:1`
  - `SceneCarousel` component: AnimatePresence crossfade, 2500ms auto-advance
  - Dot indicators (pill-style active, circle inactive), clickable
  - Left/right half-screen click zones for prev/next
  - Carousel resets on step change, cleans up interval
  - Both mobile (full-screen bg) and desktop (45vh panel) use carousel

## Next Priorities (from PROJECT.md)
1. Immersive choice UX — scene backdrop + consequence hints
2. Test full playthrough on Horror + Mystery universes
3. Cost modeling before scaling
4. Hero BG blurry on retina — needs 2x source

## Key Files
- `src/store/useStore.ts` — multi-character Zustand store
- `src/hooks/useActiveStory.ts` — derived state hook
- `src/lib/claudeStream.ts` — streaming prose + chat + memory extraction
- `src/lib/affinity.ts` — tier definitions
- `src/data/storyData.ts` — STORY_STEPS, SCENE_PROMPTS (all beats now carousel)
- `src/components/ChatScene.tsx` — single-character chat + mood stages
- `src/components/SceneChat.tsx` — multi-character scene chat
- `src/pages/StoryReaderPage.tsx` — main reader (SceneCarousel wired in)
- `src/contexts/AuthContext.tsx` — Supabase auth session
- `src/pages/LoginPage.tsx` — Google sign-in page
- `src/components/ProtectedRoute.tsx` — auth guard + sign out button

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
