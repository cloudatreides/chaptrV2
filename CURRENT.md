# Chaptr V2 — Current Session State

## In Progress
- Nothing — all features complete

## Done This Session
- Feature 1: Free Chat Mode — `/free-chat` route, all universe characters as tabs, full playthrough context, no limits
- Feature 2: Affinity Levels — 5 tiers (Stranger→Confidant), `characterAffinities` in store, AffinityBadge component, tier prompt modifiers in Claude, growth per exchange in all chat components
- Feature 3: Character-Initiated Messages — ping system in `src/data/pings.ts`, PingNotification component (notification + mini-chat drawer), triggers after step transitions with affinity gates
- Feature 4: Side Stories / Character Quests — quest system in `src/data/quests.ts`, QuestPage with beat/chat steps, QuestUnlockToast, sidebar integration, quest summaries feed into main context
- Feature 5: Memory / Callback System — `extractMemories` in claudeStream.ts (lightweight Claude call, JSON array output), `generateOpeningMessage` + `streamChatReply` accept `characterMemories[]`, injection in all 3 chat components (ChatScene, SceneChat, FreeChatPage), extraction every 2nd exchange fire-and-forget. Also fixed `characterAffinities` destructuring bug in FreeChatPage.
- Feature 6: Group Chat Scenes — `GroupChatScene.tsx` component (unified thread, round-robin rotation, 30% AI-to-AI reactions via `generateGroupReaction`), `groupChat?: boolean` flag added to `StoryStep`, StoryReaderPage renders GroupChatScene when flag is set. Memory extraction wired in.
- All 4 prior features committed + pushed to production

## Feature 5: Memory / Callback System — REMAINING WORK

### What's done:
- `characterMemories: Record<string, string[]>` added to StoryProgress in store
- `addCharacterMemory(characterId, memory)` action added (caps at 10 per character)
- Default + migration updated

### What still needs to be built:

1. **`extractMemories` function in `src/lib/claudeStream.ts`**:
   - New function that takes a chat transcript and extracts 1-2 memorable facts
   - Lightweight Claude call: system prompt asks for 1-2 bullet points of what the protagonist revealed about themselves
   - Return `string[]` (the extracted facts)
   - Example: "The protagonist mentioned they play guitar" or "They said they're scared of being alone"

2. **Inject memories into Claude system prompts** (in `src/lib/claudeStream.ts`):
   - In both `streamChatReply` and `generateOpeningMessage`, add a new optional param `characterMemories?: string[]`
   - If memories exist, append to system prompt: `\n\nTHINGS THE PROTAGONIST HAS TOLD YOU:\n- [memory1]\n- [memory2]\nWeave these naturally into conversation when relevant. Don't force it.`

3. **Call extraction after exchanges** in all 3 chat components:
   - `src/components/ChatScene.tsx` — after successful exchange, fire-and-forget `extractMemories` call, then `addCharacterMemory` for each result
   - `src/components/SceneChat.tsx` — same pattern
   - `src/pages/FreeChatPage.tsx` — same pattern
   - Only extract every 2-3 exchanges (not every single one) to manage API costs. E.g., `if (newExchange % 2 === 0)`

4. **Pass memories from store to Claude calls**:
   - All 3 chat components already read `characterAffinities` from `useActiveStory()` — `characterMemories` is also already exposed via `...progress` spread
   - Pass `characterMemories[activeCharId]` to `streamChatReply` and `generateOpeningMessage`

## Feature 6: Group Chat Scenes — SPEC

All characters in one thread, responding to each other.
- New flag on scene steps: `groupChat: true`
- Shared message thread — after each user message, pick which character responds (relevance/rotation)
- Characters can respond to each other (AI-to-AI, capped 1-2 per user message)
- UI: messages show character avatar + name label. Single unified thread, no tabs.
- System prompt includes all character profiles + group dynamics instruction

## Key Architecture Notes
- Love interest DERIVED from gender: `male → 'yuna'`, `female → 'jiwon'`
- Progress keyed by `characterId:universeId`
- `useActiveStory()` spreads progress flat, exposes `primaryNpcName`
- Scene steps: `type: 'scene'` with `sceneCharacters` array
- Soft caps: `maxExchanges` only triggers wind-down hints
- `chatImagePrompt` overrides `introImagePrompt` for chat headers
- Anti-slop: WRITING STYLE block + post-processing strip
- Trust JSON buffering: hold back `{`, flush if not JSON
- Affinity tiers inject `promptModifier` into system prompts
- Pings evaluated on step transitions via `prevStepIndexRef`
- Quest summaries saved to `chatSummaries` with `quest:` prefix for main story context

## Key Files
- `src/store/useStore.ts` — multi-character Zustand store (StoryProgress has all state)
- `src/hooks/useActiveStory.ts` — derived state hook (spreads progress flat)
- `src/lib/claudeStream.ts` — streaming prose + chat + choice + memory extraction
- `src/lib/affinity.ts` — tier definitions + growth formula
- `src/data/pings.ts` — character-initiated message definitions
- `src/data/quests.ts` — side story definitions
- `src/components/ChatScene.tsx` — single-character chat
- `src/components/SceneChat.tsx` — multi-character scene chat with tabs
- `src/components/PingNotification.tsx` — ping notification + mini-chat
- `src/components/QuestUnlockToast.tsx` — quest unlock notification
- `src/components/AffinityBadge.tsx` — tier label + fill bar
- `src/pages/FreeChatPage.tsx` — post-story free chat
- `src/pages/QuestPage.tsx` — mini story reader for quests
- `src/pages/StoryReaderPage.tsx` — main reader (beats, choices, chat, scenes, pings, quest toasts)
- `src/pages/RevealPage.tsx` — reveal + affinity summary + "Keep talking" button

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (proxied) + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
