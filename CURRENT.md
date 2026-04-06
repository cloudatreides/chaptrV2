# Chaptr V2 — Current Session State

## In Progress
- Retention features (3 of 6 remaining — see Next section)

## Done This Session
- **Feature 1: Cross-story global affinity** — new `globalAffinities` store field persists NPC affinity across all playthroughs (max of any run). Injected into Claude system prompts via `buildMemoryPrompt()` helper. Wired through ChatScene, SceneChat, GroupChatScene.
- **Feature 2: Story memory across playthroughs** — new `playthroughHistory` store field (capped at 50). RevealPage records completed runs. Claude gets previous choices/signatures injected into prompts so characters can reference past playthroughs organically.
- **Feature 4: Mid-story shareable moments** — new `ShareMomentToast` component. After each choice, slide-up toast lets player share "I chose to [X] in [Universe]" to clipboard. Auto-dismisses after 8s.
- **Feature 5: Community stats** — static seed data in `communityStats.ts` for all 10 choice points across 5 universes. After player chooses, ChoicePoint shows animated percentage bars per option with "rare" badge for <30%.
- **Feature 6: Gem-gated premium choices** — extended `ChoiceOption` type with `premium`/`gemCost`. Added "Crash the rehearsal" (15 gems) to cp-1 and full branch content (unique beat + scene + 2 endings). ChoicePoint renders premium cards with gold styling, gem icon, cost badge, insufficient-gems warning.
- **Store v3 migration** — added `globalAffinities`, `playthroughHistory`, `ambientPings`, `lastSessionTimestamp` to persisted state. Version bumped 2→3.

## Next
1. **Feature 3: Ambient pings** — create `src/data/ambientPings.ts` (2-3 defs per universe, gated by global affinity tier + hours inactive). Create `AmbientPingModal` component (mini-chat, max 3 exchanges). Wire into HomePage (check on mount, show unread badge + notification cards).
2. **HomePage relationships section** — show NPC avatars with global affinity tier labels in a "Relationships" section (only chars with affinity > 0).
3. **Wire `previousPlaythroughs` to `streamBeatProse`** — StoryReaderPage beat generation doesn't pass playthrough history to Claude yet (chat functions do).
4. Test full playthroughs — verify premium choice flow, community stats display, cross-story memory injection.

## Blockers
- None

## Key Files Changed This Session
- `src/store/useStore.ts` — 4 new persisted fields, 8+ new actions, v3 migration, global affinity sync in updateAffinity
- `src/lib/claudeStream.ts` — `buildMemoryPrompt()` helper, new params on StreamBeatParams/StreamChatParams/OpeningMessageParams
- `src/data/storyData.ts` — ChoiceOption extended, premium cp-1 option + crash path beats/scene/endings
- `src/data/communityStats.ts` — NEW, static seed percentages for all choice points
- `src/components/ChoicePoint.tsx` — rewritten with premium styling, community stats bars, resolved state, gem gating
- `src/components/ShareMomentToast.tsx` — NEW, shareable choice moment toast
- `src/pages/StoryReaderPage.tsx` — community stats wiring, share toast, premium gem handling, stats delay
- `src/pages/RevealPage.tsx` — playthrough history recording
- `src/components/ChatScene.tsx` — pass globalAffinityScore + previousPlaythroughs to Claude
- `src/components/SceneChat.tsx` — same
- `src/components/GroupChatScene.tsx` — same

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
