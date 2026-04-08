# Chaptr V2 — Current Session State

## In Progress
- Run SQL migration for `user_game_state` table in Supabase (see `supabase/migrations/001_user_game_state.sql`)
- Verify game state sync works: log out → log back in → chat history persists

## Done This Session

### Per-User Game State Sync (Supabase)
- Created `user_game_state` table (JSONB per user with RLS)
- `src/lib/gameStateSync.ts` — save/load/debounced queue/flush helpers
- `src/hooks/useGameStateSync.ts` — auto-save on every store change (5s debounce)
- `src/contexts/AuthContext.tsx` — hydrate from cloud on login, save to cloud before logout
- `src/App.tsx` — wired GameStateSync wrapper inside AuthProvider

### Chat Actions Polish
- Unlocked all actions for testing (tier-gating bypassed, TODO to restore)
- Action bubbles now parse from message content (persist on reload, no more `[ACTION: ...]` text)
- Redesigned action bubbles as styled sticker cards (big emoji + decorative particles)
- Fixed animation flickering during streaming (removed Framer Motion, static card with React.memo)
- Gem balance badge on + button when tray is closed
- Hover tooltips via footer info bar (description, gem cost, affinity boost)
- Letter writing overlay for "Write a Letter" action (requiresInput field)
- Romantic actions trigger AI-generated character reaction portraits (Together AI)

### Affinity Tier-Gating Restored
- `getAvailableActions()` now filters by `minTier <= tierIndex` again (was bypassed for testing)
- Locked actions show with lock icon and required tier label in ChatActionTray
- Tier index derived from affinity score using genre-aware tier definitions (ROMANCE vs default)

### Mobile Polish
- ChatActionTray popup: added `z-50` to prevent clipping under other elements
- ChatActionTray popup: `maxHeight` now uses `min(340px, 60dvh)` to avoid overflow on small screens
- CastChatPage + CastGroupChatPage: input font size bumped to `text-base` (prevents iOS auto-zoom on focus)
- CastChatPage + CastGroupChatPage: added `safe-bottom` to input containers for notch/home bar clearance

### Build Fixes
- Fixed multiple TS6133 errors (unused `tierIndex`, `resolvedLabel` params)
- Fixed action bubbles applied to both CastChatPage and CastGroupChatPage

## Next
- Verify Supabase migration ran successfully and test login/logout persistence
- Run `/qa` on Chat Actions feature end-to-end (needs node/dev server)
- Consider adding touch-friendly tap targets for action buttons on mobile (currently 3-col grid works but could be tight on small phones)

## Blockers
- `user_game_state` table must be created in Supabase before sync works
- Node.js not available in current shell — can't run build/dev server for QA

## Key Files Changed
- `src/data/chatActions.ts` — Restored tier-gating in `getAvailableActions()`
- `src/components/ChatActionTray.tsx` — z-index fix, dvh-aware maxHeight
- `src/pages/CastChatPage.tsx` — text-base input, safe-bottom padding
- `src/pages/CastGroupChatPage.tsx` — text-base input, safe-bottom padding
- `src/lib/gameStateSync.ts` — NEW: Supabase game state CRUD + debounced save
- `src/hooks/useGameStateSync.ts` — NEW: Auto-save hook
- `src/contexts/AuthContext.tsx` — Cloud hydration on login, save on logout
- `src/App.tsx` — GameStateSync wrapper
- `src/components/ChatActionBubble.tsx` — Static sticker card design
- `src/components/ChatReactionImage.tsx` — NEW: Reaction portrait in chat thread
- `src/hooks/useChatActions.ts` — Reaction image prompt generation
- `supabase/migrations/001_user_game_state.sql` — NEW: Table + RLS policies
