# Chaptr V2 — Current Session State

## In Progress
- Decide whether to swap FLUX → Gemini (Nano Banana) for production image gen. Bench at `/admin/image-bench` has all 6 models running side-by-side now.

## Done This Session

### Image bench at `/admin/image-bench` — full A/B testing tool
Two tabs now:

**Tab 1 — Bench**: side-by-side comparison of 6 models on the same prompt + references.
- FLUX.2 Pro / Kontext Pro / Schnell / Nano Banana 2 (Gemini 3.1 Flash) / Nano Banana Pro (Gemini 3 Pro) / Nano Banana (Gemini 2.5)
- Per-tile latency, cost-per-image, projected $ at 1k images
- Twin debug panel — lists every twin in store with URL classification (SUPABASE / DATA URL / DEAD / NO SELFIE), per-twin delete button
- "Reset twins only" purple button in header — wipes character records but keeps trips/stories/moments intact

**Tab 2 — Image-gen actions audit (16 entries)**: source-of-truth doc for every image-gen call site in the app.
- Categorized: Twin / Travel / Story / Chat reaction / Cast
- Each entry shows: feature, trigger, source (file:line), model tier, reference requirements, prompt template, notes
- "Load into bench" button drops a prompt into the bench tab for one-click testing across all 6 models

### Nano Banana (Gemini) integration
- New Edge proxy: `api/nano-banana.ts`. Walks model chain (3.1 Flash → 3 Pro → 2.5 Flash) with `?action=list` debug endpoint
- Uses `GEMINI_API_KEY` env var (set in Vercel)
- Confirmed: free-tier key has access to all 3 image models — no paid upgrade needed for testing
- Verdict so far: Gemini 3.1 Flash visibly wins on identity match in two-character scenes

### Sync layer hardening (3 layers)
**Layer 1 — visible status pill** (`SyncIndicator.tsx`): top-right of home page shows `Saving...` / `Saved` / `Save failed` in real time. Click red pill to expand the actual error.

**Layer 2 — retry with exponential backoff**: 4 attempts at 2s/5s/15s/60s (~82s reach). `classifyError()` splits transient (auth, network) vs permanent (RLS, schema) failures.

**Layer 3 — server-side telemetry** via `/api/log-sync-error` Edge endpoint using `SUPABASE_SERVICE_ROLE_KEY`. Writes to `sync_errors` table. Sample queries baked into the migration as comments (failure rate by classification, top error codes, payload size distribution).

**Required setup** (already done by user):
- `migrations/004_sync_errors.sql` — run in Supabase SQL Editor
- `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` env vars in Vercel

### Cross-session data loss bugs — multiple fixes
- **`hydrateFromCloud` was overwriting local with stale cloud data.** `lastSessionTimestamp` only updated on home-page mount, so creating a twin and refreshing within seconds caused cloud to "win" with a stale timestamp. Now: prefers local whenever local has any data; cloud only wins when localStorage is empty (genuinely-fresh device).
- **Debounce window 5s → 1.5s.** Old window meant any refresh/navigation within 5s of state changes lost the save.
- **`beforeunload` + `pagehide` flush** — best-effort save before tab close.
- **`travelTrips` and `activeTripId` were silently NOT synced to cloud** — only persisted to localStorage. Lost on every logout. Added to both `useGameStateSync` and `signOut`'s explicit save.
- **Cross-email contamination fix** — when signing in with a different email, getSession now force-reloads (matching what onAuthStateChange already did). The previous code cleared localStorage but left the in-memory Zustand store hydrated from old user's data.

### Image storage hardening
- `uploadImageToStorage` now strictly returns durable URL or `null` — never ephemeral. Three failure paths previously returned the original Together AI `/shrt/` URL as fallback, which then propagated through `persistImage` → all callers → store actions → `chaptr_image_cache` table. Hours later, every persisted image 404'd.
- New fallback: if Supabase upload fails but blob is in hand, convert to `data:` URL (durable, heavier in localStorage).

### Twin URL repair UX
- Home page now detects ephemeral/dead URLs via `hasUsableSelfie()` — shows Upload CTA instead of a broken `<img>`.
- Edit twin page shows "Your photo expired" red banner when `existingSelfie` is dead, collapses photo section to upload dropzone.
- Edit twin save path now auto-`setActiveCharacter(editId)` so editing a non-active twin updates active too — fixes "I uploaded a photo but the bench still shows the old URL" bug.

### Departure scene prompt rewrite (FLUX.2 quality)
Three iterative fixes — each from a real screenshot:
1. Gender + companion description now baked into the **scene prompt itself**, not just the FLUX wrapper preamble. Pattern matches the working `takeSelfie` prompt.
2. Removed `(from image 1)` / `(from image 2)` reference-position language — broke Schnell fallback path which doesn't take references.
3. `companionVisualDesc` for **remixed companions** previously returned personality traits as visual description ("adventurous, witty, confident"). Now returns empty string for remixes — relies on the user's uploaded portrait reference instead.

### Other small fixes
- Edit-name flow no longer wipes selfieUrl when `photoTouched` is false
- "Set as default" button on home twin hero (multi-twin users)
- Bench inputs persist to localStorage; "Use active twin" link when twin URL doesn't match active

## Next
1. **Run all 6 models on a few key audit-table entries** — selfie, hold-hands, gift reaction. Decide swap-FLUX-for-Gemini.
2. **If Gemini wins**: route in production by replacing call sites in `togetherAi.ts` with `nanoBanana.ts`. Per-feature routing also possible (e.g. Gemini for two-character scenes, FLUX for solo reactions).
3. **GTM launch** — sync layer is now resilient enough.
4. **Existing dead-URL twins still need manual re-upload** — only fixed for *new* twins. Use the bench's "Reset twins only" button or run the SQL `update user_game_state set state = state || '{"characters": [], "activeCharacterId": null}'::jsonb` to clear and re-create.

## Key Files
- `src/pages/AdminImageBenchPage.tsx` — bench + audit tabs (~900 lines)
- `src/lib/nanoBanana.ts` — Gemini client wrapper
- `api/nano-banana.ts` — Gemini Edge proxy with model-chain fallback
- `api/log-sync-error.ts` — server-side telemetry
- `src/lib/gameStateSync.ts` — sync with retry, classification, telemetry
- `src/components/SyncIndicator.tsx` — pill UI
- `src/contexts/AuthContext.tsx` — fixed hydrate + cross-email contamination
- `src/lib/togetherAi.ts` — `toAbsoluteImageUrl()` wrapper, persistImage now returns nullable
- `src/lib/supabase.ts` — `uploadImageToStorage` no longer leaks ephemeral URLs
- `supabase/migrations/004_sync_errors.sql` — telemetry table

## Blockers / Known Limitations
- **Multi-device conflict resolution post-GTM**: prefer-local strategy will favor whichever device the user is on, can clobber a Device-A twin if Device-B opens with stale state. Acceptable for solo testing now.
- **Free-tier Gemini rate limits** at scale — fine for testing, may need paid tier for production traffic.
- **`data:` URL fallback bloats localStorage** if Supabase upload fails consistently — verify `chaptr-images` bucket policies if you see large state sizes.
