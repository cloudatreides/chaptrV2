# Chaptr V2 — Current Session State

## In Progress
- Nothing active — ready for next session

## Done This Session
- **Immersive choice UX** — Choice steps now render with AI-generated scene backdrops (same FLUX pipeline as beats) instead of flat dark backgrounds. Choice steps use the beat layout with image area + gradient overlay.
- **Per-option preview images** — Each choice card shows its own preview image (what that path leads to). 2 FLUX calls per choice point. `imagePrompt` added to `ChoiceOption` type across all 3 stories.
- **Consequence hints** — Each choice option shows a 1-sentence italic hint below the description previewing what happens. Color-matched to accent bars (pink/purple).
- **Trust JSON leak fix** — Streaming now buffers trailing `{` content so `{"trustDelta":...}` JSON never reaches the typewriter display. Clean prose shown after extraction.
- **Pointer-events fix** — All backdrop/gradient overlay divs now have `pointer-events-none` to prevent blocking touch/click events on mobile. Fixes menu button and choice card click issues.
- **Personality-aware reply suggestions** — Chat input shows 3 suggestion chips that match the user's personality archetype (Quiet/Bold/Dreamer). Suggestions evolve across 3 depth tiers (opening/mid/deep) based on exchange count.
- **Mood progression display** — Chat header shows all 4 mood stages as a visual track (e.g. guarded → warming up → opening up → vulnerable). Current stage highlighted pink, past stages dim, future faint.
- **Universe sort order** — Locked stories sort below unlocked ones in the "All" tab.

## Next — Suggested
1. **Full playthrough test** — play through each story path on live to catch bugs, pacing issues, or remaining slop
2. **Opening prose for non-Seoul stories** — only beat-1 of Seoul Transfer has `openingProse`. Hollow Manor and Last Signal generate their first beat via AI, which means a loading spinner on the very first scene. Consider adding static openingProse.
3. **Mobile polish** — test choice cards, suggestion chips, mood progression on small viewports
4. **Cost check** — with per-option images (2 extra FLUX calls per choice point), verify Together AI costs per playthrough

## Key Architecture Notes
- Love interest DERIVED from gender: `male → 'yuna'`, `female → 'jiwon'`
- Progress keyed by `characterId:universeId`
- `useActiveStory()` spreads progress flat for easy destructuring
- Anti-slop: WRITING STYLE block in both `generateOpeningMessage` and `streamChatReply` system prompts
- Player name: `StreamBeatParams.playerName` passed through to `buildBeatSystemPrompt()`
- Per-option images stored in `sceneImages` with composite key `${stepId}:${optionId}`
- Trust JSON buffering: streaming loop holds back content after `{`, flushes only if not JSON
- Mood stages: `MOOD_STAGES` record in ChatScene.tsx, keyed by characterId with fallback to default
- Suggestion chips: `SUGGESTIONS` record keyed by personality type × depth tier

## Env Vars in Vercel
- `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`, `SUPABASE_ANON_KEY` (all server-side)

## Open Issues
- Hero BG blurry on retina
- Cost modeling needed before scaling
- SharedRevealPage uses neutral "They see you as"

## Key Files
- `src/store/useStore.ts` — multi-character Zustand store
- `src/hooks/useActiveStory.ts` — derived state hook
- `src/components/ChoicePoint.tsx` — choice UI with per-option images, consequence hints, player avatar
- `src/components/ChatScene.tsx` — chat with mood progression, suggestion chips
- `src/data/storyData.ts` — Seoul Transfer story steps + scene prompts + choice option imagePrompts
- `src/data/stories/hollow-manor.ts` — Hollow Manor story
- `src/data/stories/the-last-signal.ts` — The Last Signal story
- `src/pages/StoryReaderPage.tsx` — main reader with trust JSON buffering, pointer-events-none overlays
- `src/lib/claudeStream.ts` — Claude API streaming + anti-slop rules
- `src/lib/ambientAudio.ts` — Web Audio ambient pads

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (proxied) + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
