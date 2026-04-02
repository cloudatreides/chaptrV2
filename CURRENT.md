# Chaptr V2 — Current Session State

## In Progress
- Nothing active

## Done This Session
- **Multi-character refactor complete**: All consumer components migrated to `useActiveStory()` hook
  - Store: multi-character support with `storyProgress` keyed by `characterId:universeId`
  - New pages: `CharacterSelectPage`, `CreateCharacterPage` (pick/create up to 3 characters)
  - New hook: `useActiveStory()` — single source of truth for active character + progress
  - Updated: `StoryReaderPage`, `ChatScene`, `YourStorySheet`, `YourStorySidebar`, `RevealPage`
  - v1→v2 localStorage migration with backward compat
  - Flow: Landing → Universes → Characters → Create Character → Story
  - Removed broken `branchChoices` getter from store (zustand Object.assign strips getters)
- **Multi-universe data**: Horror (Hollow Manor) + Mystery (The Last Signal) — unlocked, story data + placeholder SVGs
- **Social loop**: API proxy, analytics, playthrough persistence, share URLs, OG meta

## Key Architecture Notes
- Love interest is DERIVED from gender, never stored. `male → 'yuna'`, `female → 'jiwon'`
- Progress keyed by `characterId:universeId`. All progress actions internally resolve active key.
- `useActiveStory()` spreads progress flat: destructure `{ currentStepIndex, branchChoices, ... }` directly
- `DEFAULT_PROGRESS` exported from store for hook use

## Env Vars Needed in Vercel
- `ANTHROPIC_API_KEY` (server-side, no VITE_ prefix)
- `TOGETHER_API_KEY` (server-side, no VITE_ prefix)
- `SUPABASE_ANON_KEY` (for api/og.tsx and api/share.ts)

## Next
- Delete old unused files: `BioPage.tsx`, `UploadPage.tsx`
- Test full playthrough on each universe (Seoul Transfer, Hollow Manor, The Last Signal)
- Love interest picker: only relevant for romance universes
- Bio/personality: verify archetype selection feeds through to Claude prompts correctly

## Open Issues
- Hero BG blurry on retina — needs 2x source image
- Cost modeling needed before scaling
- SharedRevealPage uses neutral "They see you as" since playthrough data may not have love_interest

## Key Files
- `src/store/useStore.ts` — multi-character Zustand store with progress map
- `src/hooks/useActiveStory.ts` — derived state hook (THE way to read character+progress)
- `src/pages/CharacterSelectPage.tsx` — character picker (max 3)
- `src/pages/CreateCharacterPage.tsx` — character creation (name, gender, personality, selfie)
- `src/components/ChatScene.tsx` — updated for useActiveStory
- `src/pages/RevealPage.tsx` — updated for useActiveStory
- `src/lib/claudeStream.ts` — accepts loveInterest + universeId params

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (proxied) + Together AI FLUX (Schnell for scenes/portraits, Kontext for selfie)
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
