# Chaptr V2 — Current Session State

## In Progress
- **Immersive choice UX** — make choice points more cinematic

## Next Task: Immersive Choice Points
Two enhancements to the `ChoicePoint` component (`src/components/ChoicePoint.tsx`):

### 1. Scene image backdrop for choice moments
- Each choice step in `storyData.ts` already supports `sceneImagePrompt` — add one per choice step if missing
- `StoryReaderPage` already generates scene images for beat steps — extend to choice steps
- The choice UI should overlay on the scene image (same pattern as beat steps, not the current flat dark bg)
- No extra image gen calls needed — 1 image per choice point, not per option

### 2. AI-generated consequence preview text
- Under each choice option label, show a 1-sentence hint of what happens if you pick it
- Add `consequenceHint` field to choice options in `storyData.ts`
- Generate these via Claude at choice render time (1 API call for all options)
- OR hardcode them in story data for V1 (cheaper, faster, no latency)
- Recommendation: hardcode for now, AI-generate later

### Key files to modify:
- `src/components/ChoicePoint.tsx` — main UI component
- `src/data/storyData.ts` — add `sceneImagePrompt` to choice steps, add `consequenceHint` to options
- `src/pages/StoryReaderPage.tsx` — extend scene image generation to choice steps, pass scene image to ChoicePoint

## Done This Session
- Multi-character refactor complete (store, hook, all consumers)
- Fixed TypeScript build errors (was breaking all Vercel deploys)
- Fixed stylized selfie clipped in CreateCharacterPage
- Fixed ambient audio not playing (deferred audio nodes until user gesture)
- Vercel env var typo fixed (`ANTRHOPIC_API_KEY` → `ANTHROPIC_API_KEY`)

## Key Architecture Notes
- Love interest DERIVED from gender: `male → 'yuna'`, `female → 'jiwon'`
- Progress keyed by `characterId:universeId`
- `useActiveStory()` spreads progress flat for easy destructuring
- `DEFAULT_PROGRESS` exported from store

## Env Vars in Vercel
- `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`, `SUPABASE_ANON_KEY` (all server-side)

## Open Issues
- Hero BG blurry on retina
- Cost modeling needed before scaling
- SharedRevealPage uses neutral "They see you as"
- Test full playthrough on Hollow Manor + The Last Signal

## Key Files
- `src/store/useStore.ts` — multi-character Zustand store
- `src/hooks/useActiveStory.ts` — derived state hook
- `src/components/ChoicePoint.tsx` — choice UI (TARGET for this task)
- `src/data/storyData.ts` — story steps + choice data (TARGET for this task)
- `src/pages/StoryReaderPage.tsx` — main reader
- `src/lib/claudeStream.ts` — Claude API streaming
- `src/lib/ambientAudio.ts` — Web Audio ambient pads

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (proxied) + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
