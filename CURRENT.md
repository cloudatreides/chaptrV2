# Chaptr V2 — Current Session State

## In Progress
- Nothing active — ready for next session

## Done This Session
- **Multi-character scene chat** — New `scene` step type with character tabs, per-character message state, cross-character context sharing via `sceneContext` in Claude prompts. SceneChat.tsx component. Restructured Seoul Transfer (chat-1b → scene-1, chat-2a/3a → scene-2a, chat-2b/3b → scene-2b)
- **Soft exchange cap** — Removed hard `isDone` / `maxExchanges` cap from both ChatScene and SceneChat. Conversations stay open indefinitely. Continue button appears after `minExchanges` but never forces end. Wind-down hints still fire in Claude prompts near maxExchanges.
- Prior session: sshe fix, chat summary strip, universe-aware sidebar, per-chat contextual images, partner label fix

## Next — Engagement Features (execute in order: 1 → 2 → 5 → 3 → 4 → 6)

### Feature 1: Free Chat Mode (post-story)
After the reveal page, unlock all story characters for open-ended conversation. No story gates, no advancing — just hang out. Relationship context (trust, summaries, choices) carries forward.
- New route: `/free-chat`
- New page: `FreeChatPage.tsx` — SceneChat-like UI with all characters unlocked as tabs
- Pass full playthrough context into Claude prompts
- No Continue button — pure affinity building
- "Keep talking" button on RevealPage navigates here

### Feature 2: Affinity Levels (visible progression)
Per-character affinity tiers that replace the single trust bar.
- Tiers: Stranger (0-15) → Acquaintance (16-35) → Friend (36-55) → Close (56-80) → Confidant (81-100)
- Visual: tier label + fill bar in chat header and character tabs
- System prompt modifier at each tier threshold (character's tone/openness shifts)
- Store: add `characterAffinities: Record<string, number>` to StoryProgress
- Affinity grows with exchange count. Display in sidebar + reveal page.

### Feature 3: Character-Initiated Messages
Characters "text first" between beats — async messages that make the world feel alive.
- New step type: `'ping'` — short character-initiated message between beats
- Data: `{ type: 'ping', characterId: 'sora', trigger: 'after-scene-1' }`
- Generate via Claude (1-2 sentences, in character, referencing recent context) or use static message
- UI: chat bubble notification, tappable to open mini-conversation (2-3 exchanges) or dismiss
- Trigger based on affinity level or story progression

### Feature 4: Side Stories / Character Quests
Unlockable mini-arcs per character, gated by affinity.
- `characterQuests` array in character definitions — each has affinity gate, title, 2-3 steps (beat + chat)
- Quest unlock notification when threshold met. Accessible from chat tab or sidebar.
- Runs as mini-story within scene framework — same beat/chat rendering, scoped to quest
- Quest summaries feed back into main story context
- Examples: Sora's audition prep (Friend), Yuna/Jiwon's secret song (Close)

### Feature 5: Memory / Callback System
Characters remember specific things you said and reference them later.
- After each chat, extract 1-2 "memorable facts" via lightweight Claude call (or parse from summaries)
- Store: `characterMemories: Record<string, string[]>` in StoryProgress
- Inject into system prompts: "Things the protagonist has told you: [list]"
- Characters naturally weave these in: "You mentioned you liked [X] earlier..."
- Cap ~10 memories per character for prompt size

### Feature 6: Group Chat Scenes
All characters in one thread, responding to each other.
- New flag on scene steps: `groupChat: true`
- Shared message thread — after each user message, pick which character responds (relevance/rotation)
- Characters can respond to each other (AI-to-AI, capped 1-2 per user message)
- UI: messages show character avatar + name label. Single unified thread, no tabs.
- System prompt includes all character profiles + group dynamics instruction

### Execution Order Rationale
1 → 2 → 5 → 3 → 4 → 6
- Free Chat first (extends engagement immediately, simplest)
- Affinity next (gives progression system other features build on)
- Memory before Pings/Quests (makes character-initiated content personal)
- Pings and Quests leverage affinity + memory
- Group Chat last (most complex, builds on all prior systems)

## Key Architecture Notes
- Love interest DERIVED from gender: `male → 'yuna'`, `female → 'jiwon'`
- Progress keyed by `characterId:universeId`
- `useActiveStory()` spreads progress flat, exposes `primaryNpcName`
- **Scene steps**: `type: 'scene'` with `sceneCharacters` array. Love interest resolution in StoryReaderPage.
- **Soft caps**: `maxExchanges` only triggers wind-down hints. No `isDone` — conversations never forcibly end.
- **Scene context**: `sceneContext` param in claudeStream.ts. Built from last 4 messages of other conversations.
- `chatImagePrompt` overrides `introImagePrompt` for chat headers
- Anti-slop: WRITING STYLE block + post-processing strip
- Trust JSON buffering: hold back `{`, flush if not JSON

## Open Issues
- Hero BG blurry on retina
- Cost modeling needed (especially with memory extraction calls)
- SharedRevealPage uses neutral "They see you as"
- `SceneChat.tsx` doesn't use `chatImagePrompt` yet

## Key Files
- `src/store/useStore.ts` — multi-character Zustand store
- `src/hooks/useActiveStory.ts` — derived state hook
- `src/components/ChatScene.tsx` — single-character chat, soft cap
- `src/components/SceneChat.tsx` — multi-character scene chat with tabs + context sharing
- `src/data/storyData.ts` — Seoul Transfer steps, SceneCharacter interface
- `src/data/stories/index.ts` — StoryData interface
- `src/pages/StoryReaderPage.tsx` — main reader
- `src/lib/claudeStream.ts` — Claude streaming, sceneContext support

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (proxied) + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
