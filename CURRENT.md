# Chaptr V2 — Current Session State

## In Progress
- QA testing needed on the new Album/Selfie feature (run `/qa` in fresh session)

## Done This Session

### New Feature: Album & Selfie Moments
- **Store**: Added `StoryMoment` type, `storyMoments` array with `addStoryMoment`, `updateMomentNote`, `deleteStoryMoment` actions. Persisted with migration v7.
- **Album page** (`src/pages/AlbumPage.tsx`): Grid view of captured moments, detail modal with editable notes, share (clipboard), delete. Empty state with camera icon.
- **Sidebar**: Added "Album" nav item (Camera icon) to both `AppSidebar` and `YourStorySidebar`.
- **Route**: `/album` added to `App.tsx`.
- **Capture flow** (`StoryReaderPage.tsx`): After every chat/scene completion, if user has a selfie, generates a group selfie via Kontext with character descriptions from `portraitPrompt`. Shows "Save/Skip" modal. 1-on-1 chats use a two-person prompt with "ONLY these two people" to prevent phantom characters.
- **Cost**: ~$0.20 per capture (Kontext call). ~$1-1.20 per full playthrough.

### Bug Fixes
1. **Sidebar logo navigation** — Logo now goes to `/home` (app homepage) when inside the app, not `/` (landing page). Fixed in both `AppSidebar` and `StoryReaderPage` sidebar.
2. **Sidebar account/logout floating** — Changed parent layout from `min-h-screen` to `h-screen overflow-hidden` on HomePage, CastPage, AccountPage. Sidebar no longer uses `sticky top-0`.
3. **Character intro images showing wrong character** — Swapped priority: character's own `introImagePrompt` now takes precedence over shared scene `chatImagePrompt` in both `ChatScene` and `SceneChat`.
4. **"Continue the story" button disappearing** — Once shown, the button never hides again (both `ChatScene` and `SceneChat`). Previously it vanished when user kept chatting.
5. **Reveal page missing "Back to home"** — Added `ArrowLeft` button below "Try a different path".
6. **Cast chat favorite toggle** — Added star icon to desktop and mobile headers in `CastChatPage`.

### Dev Setup
- **Vite proxy**: Added `/api` proxy to `https://chaptr-v2.vercel.app` in `vite.config.ts` for local dev.
- **Auth bypass**: Already existed via `DEV_BYPASS_AUTH` in `ProtectedRoute.tsx`.

## Next
- Run `/qa` on localhost or production to verify Album feature end-to-end
- Test selfie capture quality across different story scenes
- Create `chaptr_image_cache` table in Supabase
- Cost modeling before scaling

## Blockers
- Image cache won't work until Supabase table is created

## Key Files Changed
- `src/store/useStore.ts` — StoryMoment type, store slice, migration v7
- `src/pages/AlbumPage.tsx` — NEW: Album page
- `src/pages/StoryReaderPage.tsx` — Capture flow after chat completion
- `src/components/AppSidebar.tsx` — Album nav item, logo fix
- `src/components/YourStorySidebar.tsx` — Album link in story sidebar
- `src/components/ChatScene.tsx` — Intro image priority fix, continue button fix
- `src/components/SceneChat.tsx` — Intro image priority fix, continue button fix
- `src/pages/RevealPage.tsx` — Back to home button
- `src/pages/CastChatPage.tsx` — Favorite star toggle
- `src/pages/HomePage.tsx` — h-screen layout fix
- `src/pages/AccountPage.tsx` — h-screen layout fix
- `src/pages/CastPage.tsx` — h-screen layout fix
- `src/App.tsx` — Album route
- `vite.config.ts` — API proxy for local dev

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
