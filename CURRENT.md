# Chaptr V2 — Current Session State

## In Progress
- Scene image carousel (HALF DONE — stopped at context limit)

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

## Next — Scene Image Carousel (RESUME HERE)
Half-implemented. Here's what's done vs remaining:

### Done:
- Added `sceneImagePrompts?: string[]` to StoryStep interface in storyData.ts
- Added alt-angle prompts for all scenes in SCENE_PROMPTS (elevatorAlt, rehearsalAlt, etc.)
- Updated beat-1 to use `sceneImagePrompts: [elevator, elevatorAlt]`

### Still needed:
1. Update ALL remaining beats to use `sceneImagePrompts: [primary, alt]` array
2. In StoryReaderPage.tsx — update generation logic:
   - If `sceneImagePrompts` exists, loop through array and generate each
   - Store as `${stepId}:0`, `${stepId}:1`, etc.
   - `currentImages` becomes array: `sceneImagePrompts.map((_, i) => sceneImages[\`${stepId}:${i}\`])`
3. Build carousel UI in the beat background:
   - `carouselIndex` state, auto-advance every 2500ms via useEffect
   - Framer Motion `AnimatePresence` fade between images
   - Dot indicators bottom-left, clickable
   - Touch/click prev/next

## Key Files
- `src/store/useStore.ts` — multi-character Zustand store
- `src/hooks/useActiveStory.ts` — derived state hook
- `src/lib/claudeStream.ts` — streaming prose + chat + memory extraction
- `src/lib/affinity.ts` — tier definitions
- `src/data/storyData.ts` — STORY_STEPS, SCENE_PROMPTS (carousel prompts added)
- `src/components/ChatScene.tsx` — single-character chat + mood stages
- `src/components/SceneChat.tsx` — multi-character scene chat
- `src/pages/StoryReaderPage.tsx` — main reader (needs carousel logic)
- `src/contexts/AuthContext.tsx` — Supabase auth session
- `src/pages/LoginPage.tsx` — Google sign-in page
- `src/components/ProtectedRoute.tsx` — auth guard + sign out button

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
