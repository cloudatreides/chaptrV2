# Chaptr V2 — Current Session State

## In Progress
- QA testing needed on Chat Actions feature (run `/qa` in fresh session)

## Done This Session

### New Feature: Chat Actions
Interactive actions players can send during chat sessions that render as visual cards, trigger affinity boosts, and prompt characters to react in-character.

**Core mechanics:**
- 13 actions across 4 categories: Playful, Gifts, Emotional, Romantic
- Gender-adaptive variants (M→F: "Send Roses", F→M: "Baked Cookies")
- Affinity tier-gating (actions unlock as relationship deepens)
- Gem economy integration (free actions have 30-min cooldowns, gem actions have no cooldown)
- "Their Favorite Thing" action creates memory-system payoff loop (+10 if memory matches, +3 otherwise)
- Mystery Box randomizes affinity boost (1-8)
- favoriteThingHint injected into Claude prompts at Friend+ tier (affinity >= 36) so players can discover favorites through conversation

**Wired into all 6 chat surfaces:**
- ChatScene (story chats)
- SceneChat (multi-character scenes)
- GroupChatScene (group chats)
- FreeChatPage
- CastChatPage
- CastGroupChatPage

### Previous Session: Album & Selfie Moments
- Album page, selfie capture flow after chat completion, Kontext image generation
- Various bug fixes (sidebar, intro images, continue button, reveal page, cast chat)

## Next
- Run `/qa` on localhost to verify Chat Actions feature end-to-end
- Test action tray UX across different chat surfaces
- Verify favoriteThingHint appears in Claude responses at Friend+ tier
- Create `chaptr_image_cache` table in Supabase (from previous session)

## Blockers
- Image cache won't work until Supabase table is created

## Key Files Changed (Chat Actions)
- `src/data/chatActions.ts` — NEW: Action registry, gender variants, helpers
- `src/components/ChatActionTray.tsx` — NEW: Slide-up action tray UI
- `src/components/ChatActionBubble.tsx` — NEW: Action card in chat thread
- `src/hooks/useChatActions.ts` — NEW: Action execution hook
- `src/data/characters.ts` — Added gender, favoriteThing, favoriteThingHint to StoryCharacter
- 14 story files — Added gender/favoriteThing/favoriteThingHint to all 28 universe characters
- `src/store/useStore.ts` — Action cooldown tracking (30-min window)
- `src/lib/claudeStream.ts` — favoriteThingHint injection at Friend+ tier
- `src/components/ChatScene.tsx` — Wired actions into story chat
- `src/components/SceneChat.tsx` — Wired actions into scene chat
- `src/components/GroupChatScene.tsx` — Wired actions into group chat
- `src/pages/FreeChatPage.tsx` — Wired actions into free chat
- `src/pages/CastChatPage.tsx` — Wired actions into cast chat
- `src/pages/CastGroupChatPage.tsx` — Wired actions into cast group chat

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
