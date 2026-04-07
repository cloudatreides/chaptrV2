# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress

## Done This Session

### Bug Fixes — UI Polish Pass

1. **Affinity tags leaking into chat** — `[AFFINITY:+1]` was showing in story chat bubbles. Added `parseAffinityDelta()` stripping to ChatScene, SceneChat, and GroupChatScene (both stored messages and streaming display). Cast chat pages already had this.

2. **Duplicate affinity display** — AffinityBadge was shown in both the chat header and the sidebar. Removed from chat headers (ChatScene, SceneChat, GroupChatScene) — affinity now only shown in sidebar.

3. **Scene images not loading (production)** — Together AI changed FLUX.1-schnell to require `aspect_ratio` instead of `width`/`height`. Updated `togetherAi.ts` to use `aspect_ratio` for Schnell calls (scenes + portraits). Kontext Pro unchanged.

4. **Cast chat input losing focus** — `ChatInput` was defined as a function component inside the render body of `CastChatPage`. Every keystroke re-rendered the parent → new component reference → React unmount/remount → lost focus. Changed to a JSX variable.

5. **Affinity subtext barely visible** — Bumped "Chat more to build affinity..." text from `text-white/20` to `text-white/40` in CastChatPage sidebar.

6. **Landing page text contrast** — "Free to play" subtext was barely visible over hero image. Bumped opacity and added stronger text shadows.

7. **Removed "AI Interactive Story" label** — Removed from both mobile and desktop hero sections on landing page (unnecessary clutter).

8. **Mood stage text visibility** — Inactive mood stages in ChatScene and SceneChat bumped from `rgba(255,255,255,0.25)` to `rgba(255,255,255,0.4)`.

## Next
- Create `chaptr_image_cache` table in Supabase
- Test full playthrough on newer universes to verify scene image generation
- Cost modeling before scaling

## Blockers
- Image cache won't work until Supabase table is created

## Key Files Changed
- `src/components/ChatScene.tsx` — affinity tag stripping, removed AffinityBadge, mood stage visibility
- `src/components/SceneChat.tsx` — affinity tag stripping, removed AffinityBadge, mood stage visibility
- `src/components/GroupChatScene.tsx` — affinity tag stripping, removed AffinityBadge
- `src/lib/togetherAi.ts` — Schnell aspect_ratio fix, better error logging
- `src/pages/CastChatPage.tsx` — input focus fix, affinity subtext visibility
- `src/pages/LandingPage.tsx` — text contrast, removed "AI Interactive Story" label

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
