# Chaptr V2 — Current Session State

## In Progress
- **Travel pointer-management bug** — see `travel-bug.md` for full investigation. Stopped tonight after diagnosis + recovery snippet. Pick up tomorrow.

## Tomorrow — first thing

1. Open `travel-bug.md` and re-read the **Proposed solution** section.
2. Run `/investigate` with `travel-bug.md` as the brief. Goal: ship the Tier 1 minimum viable PR (~50 lines, 4 files).
3. The four changes:
   - `src/store/useStore.ts` — `startTrip` refuses to overwrite any existing trip key
   - `src/store/useStore.ts` — `setActiveCharacter` clears `activeTripId` if char-prefix doesn't match
   - `src/contexts/AuthContext.tsx` — hydrate clamps `activeTripId` to match `activeCharacterId`
   - `src/pages/TwinEditPage.tsx` — remove auto-`setActiveCharacter` from edit-save path
4. Add `CharacterSwitchToast.tsx` for visible signal on active character flip.

## What we learned tonight (summary)

- The "Day 2 → Day 1 on refresh" bug is **not a sync layer issue**. The three sync fixes shipped today (`9277437`, `ccc197a`, `f58b03c`) are valid and necessary, but don't address what happened.
- The actual bug is **active-character / active-trip pointer drift**. Nick's `activeCharacterId` flipped from `474182e9-...` (the character with the real Day 6 Kyoto trip) to `2ad0db7d-...` (a different character with no Kyoto progress). The app then created a fresh empty `kyoto:planning` trip for the new active character, which Nick saw as "reverted to Day 1."
- Nick's data is fully intact in localStorage. Recovery is a 3-line snippet that resets the active pointers — see `travel-bug.md`.
- Prime suspect for the silent flip: the edit-twin save path auto-calls `setActiveCharacter(editId)` (added recently to fix "uploaded photo doesn't appear in bench"). That should be removed; bench should read from edit target, not active character.

## Earlier this session (still valid context)

### Image bench at `/admin/image-bench` — full A/B testing tool
Two tabs: side-by-side comparison of 6 image-gen models, and an audit table of all 16 image-gen call sites in the app. See prior `CURRENT.md` revisions in git for full details.

### Nano Banana (Gemini) integration
- Edge proxy at `api/nano-banana.ts` walks model chain (3.1 Flash → 3 Pro → 2.5 Flash)
- Verdict so far: Gemini 3.1 Flash visibly wins on identity match in two-character scenes
- Decision pending: swap FLUX → Gemini in production

### Sync layer hardening (3 commits today, all on main)
- `9277437` — block `data:` URLs at boundary + v12 cleanup migration
- `ccc197a` — bump `lastLocalSave` after v12 + force-push flag so cleaned state actually reaches cloud
- `f58b03c` — chat tail cap (50 msgs) + strip regenerable scene prose + 1.5MB hard cap with visible pill

These remain valid and shipped. They fixed real bugs. They just didn't fix tonight's bug, which is upstream of sync.

## Key Files (active now)

- `travel-bug.md` — full investigation, evidence trail, proposed Tier 1/2/3 fixes. Tomorrow's brief.
- `src/store/useStore.ts:719-767` — `startTrip` action with the broken `hasProgress` guard
- `src/store/useStore.ts:setActiveCharacter` — needs invariant check
- `src/contexts/AuthContext.tsx` — hydrate path
- `src/pages/TwinEditPage.tsx` — auto-`setActiveCharacter` to remove
- `src/lib/gameStateSync.ts` — sync layer (unchanged tonight)

## Blockers / Known Limitations

- **Pointer drift bug is live in production.** Other users with multiple characters could hit it. Tier 1 PR is the priority.
- Nick's recovery snippet works for him but no UI affordance exists — multi-character users would have no way to recover without console access.
- Long-term: per-trip Supabase rows would prevent any single bad save from corrupting all state. Tier 3, deferred.

## Next (after Tier 1 ships)

1. Audit Gemini vs FLUX results on key entries (selfie, hold-hands, gift reaction). Decide swap.
2. GTM launch — sync layer is now resilient, pointer-management fix in flight.
3. Existing dead-URL twins still need manual re-upload (only fixed for new twins).
