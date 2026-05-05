# Travel Bug Investigation — 2026-04-30

## Symptom (user-reported)
"I was on Day 2 of Kyoto, clicked refresh, and got reverted back to Day 1. Lost my entire chat history."

## Actual root cause (NOT what we initially thought)

**Data was never lost.** The `activeCharacterId` got switched from `474182e9-7f18-4f3e-b72d-c5db37e24663` (the character with the real Kyoto Day 6 trip) to `2ad0db7d-1152-4573-a7ae-684a4322bbf4` (a different character with no Kyoto progress). The app then either auto-created a fresh empty `kyoto:planning` trip for the new active character, or a stray click on Start Trip created it. The "reverted" UI was actually a **different trip on a different character** — not a regression of the original.

The user has 4 characters/twins and ~12 trips in store. Two have real day-by-day progress:
- `474182e9-...:kyoto` — phase `day`, currentDay `6`, day1/2/3 chat (16/15/17 msgs), 5 itinerary days, started 2026-04-23
- `474182e9-...:bangkok` — phase `day`, currentDay `2`, day1/2 chat (26/2 msgs), companion `kai`, started 2026-04-23

This is **NOT** the bug fixed by 9277437 / ccc197a / f58b03c (those addressed `data:` URL bloat, stale `lastLocalSave`, and unbounded chat growth — all real bugs, all shipped, all working). This is a **separate bug in active-character / active-trip pointer management**.

## Evidence trail (chronological, from this session)

1. User screenshot of UI shows companion "Aniti & Claudia" on a Kyoto trip in `planning` / Day 1 phase — looked like a regression but was actually a fresh trip.
2. localStorage `chaptr-v2-story` contains:
   - `activeCharacterId`: `2ad0db7d-...` (the wrong character)
   - `activeTripId`: `028aaccd-f5c8-4cbe-919a-28989afa26c4:kyoto` (a fresh trip created at 16:32:58 SGT on 2026-04-30)
   - `chaptr-v2-last-local-save`: 1777553570111 (16:32:50 SGT)
   - `lastSessionTimestamp` (in state): 1777573832010 (22:03:52 SGT) — 5.5h gap
3. Network tab: 11x `POST user_game_state` returning 200 — saves are succeeding. Not a sync failure.
4. Console: clean. No `[Sync]` errors, no RLS / auth / payload errors. The 1.5MB hard cap from f58b03c never fired.
5. Cloud Supabase row at user_id `b68003fc-fbae-498e-988b-7a17e1775a36`:
   - `updated_at` 21:13 SGT, `cloud_bytes` 531,791
   - `state->'travelTrips'->'028aaccd-...:kyoto'` exists but has phase NULL, currentDay NULL, dayChatHistories absent, planningChatHistory empty
   - Cloud accurately mirrors local; both have empty Day 2 because that data is on a *different* trip key
6. Local store enumeration (DevTools console) confirmed 12 trips across 4 characters; only `474182e9-...:kyoto` and `474182e9-...:bangkok` have real progress.

## Why prior fixes didn't catch this

| Commit | What it fixed | Why it didn't help here |
|---|---|---|
| `9277437` | `data:` URL bloat → 413 silent fail | Saves aren't 413ing; payload is 520KB |
| `ccc197a` | Stale `lastLocalSave` after v12 cleanup | Hydrate isn't pulling stale cloud over local; local already has the correct trip data, just under a different active pointer |
| `f58b03c` | Unbounded chat growth + 1.5MB hard cap | Hard cap never fires; this isn't size-related |

All three fixes remain valid and necessary — they just don't address pointer-management drift.

## Recovery (already given to user)

```js
(()=>{const r=JSON.parse(localStorage.getItem('chaptr-v2-story'));r.state.activeCharacterId='474182e9-7f18-4f3e-b72d-c5db37e24663';r.state.activeTripId='474182e9-7f18-4f3e-b72d-c5db37e24663:kyoto';localStorage.setItem('chaptr-v2-story',JSON.stringify(r));location.reload();})()
```

Switches active character and active trip back to the real Day-6 Kyoto trip. After reload, chat history should be intact. **Do not navigate via Start Trip on a different character afterwards** — that recreates the same empty-trip-replacement scenario.

## Working theories for root cause (to investigate tomorrow)

1. **`startTrip` guard hole.** `useStore.ts:732-737` checks `hasProgress` before resetting an existing trip. The check runs against `existing = travelTrips[tripId]` for the *current* active character + selected destination. If the user is on character A but somehow `setActiveCharacter(B)` ran, then clicked Start Trip for kyoto, the guard checks `B:kyoto` which is empty → resets. Doesn't protect A's existing kyoto.
   - Fix candidate: `startTrip` refuses to overwrite if the trip key already exists at all, regardless of progress. Force callers to call a separate `resetTrip` action with explicit user intent.

2. **`setActiveCharacter` getting called unintentionally.**
   - The "Set as default" button on the home twin hero (CURRENT.md notes commit `dcb9f2b`).
   - Cross-email contamination fix in `AuthContext.tsx` (commit `004d09a`) — possibly resetting active character on `getSession` force-reload.
   - TwinPicker / TwinEdit pages calling `setActiveCharacter` on mount.
   - Edit twin save path (CURRENT.md): "auto-`setActiveCharacter(editId)` so editing a non-active twin updates active too." If user clicked Edit on a non-active twin, the active character flipped silently.

3. **Hydrate from cloud might be carrying a stale `activeCharacterId`** — if cloud's pointer disagrees with local's, hydrate could overwrite local. Need to confirm whether `activeCharacterId` is included in `buildPartialState` (it is — line 69 of `useGameStateSync.ts`).

## Investigation plan (tomorrow, fresh)

1. `/investigate` with this file as the brief.
2. Audit every call site of `setActiveCharacter` and `startTrip` in:
   - `src/pages/TwinPickerPage.tsx`
   - `src/pages/TwinEditPage.tsx`
   - `src/pages/HomePage.tsx`
   - `src/pages/TravelHomePage.tsx`
   - `src/pages/TravelCityPage.tsx`
   - `src/contexts/AuthContext.tsx`
3. Add unit-style instrumentation: temporary `console.trace` inside `setActiveCharacter` and `startTrip` actions, ship to staging, and reproduce.
4. Patch `startTrip` to refuse overwriting any existing trip key (not just `hasProgress` ones).
5. Add a SyncIndicator-style pill that surfaces "Active character switched" so silent flips become visible.
6. Consider per-character trip rooms in Supabase (not one giant JSONB row) so a wrong `activeTripId` can't propagate destructively.

## Proposed solution — three defenses in priority order

### Tier 1 — minimum viable PR (ship tomorrow)

The first change alone would have prevented tonight's data loss.

**Defense 1.A — `startTrip` non-destructive on any existing key**

Current guard at `src/store/useStore.ts:732-737`:
```js
const hasProgress = !!existing && (
  existing.phase !== 'planning' ||
  existing.planningChatHistory.length > 0 ||
  existing.itinerary.days.length > 0 ||
  Object.keys(existing.dayChatHistories).length > 0
)
if (hasProgress) { set({ activeTripId: tripId }); return }
```

If the existing trip is in fresh state (planning phase, 0 messages, no itinerary), the guard returns false and the trip object gets clobbered. Replace with:
```js
// Refuse to overwrite ANY existing trip key. To start over, the user
// must explicitly delete the trip first via deleteTrip().
if (existing) { set({ activeTripId: tripId }); return }
```
Behavior: a "Start Trip" click on a destination that already has a trip key just promotes that trip to active — never resets. Force users through `deleteTrip` to wipe.

**Defense 1.B — Active character ↔ active trip invariant**

Right now `activeCharacterId` and `activeTripId` can drift apart. Calling `setActiveCharacter(B)` while `activeTripId` is `A:kyoto` leaves the app in a state where the active trip belongs to a different character. Travel page then can't find the trip and creates a fresh one.

Fix in `src/store/useStore.ts` `setActiveCharacter`:
```js
setActiveCharacter: (id) => set((s) => {
  const tripCharPrefix = s.activeTripId?.split(':')[0]
  return {
    activeCharacterId: id,
    activeTripId: tripCharPrefix === id ? s.activeTripId : null,
  }
})
```
Apply the same check on hydrate from cloud — refuse to keep an `activeTripId` whose char-prefix doesn't match `activeCharacterId`.

**Defense 1.C — Remove auto-`setActiveCharacter` from edit-twin save path**

Per CURRENT.md: the edit twin save path was changed to auto-`setActiveCharacter(editId)` to fix "edited a non-active twin's photo, bench still showed old URL." That auto-switch is the prime suspect for tonight's silent flip.

Edit `src/pages/TwinEditPage.tsx` (or wherever edit-save lives) — remove the auto-`setActiveCharacter` call. The original bug it fixed should be re-solved a different way: the bench should always read from the twin being edited, not from `activeCharacter`.

### Tier 2 — follow-up PR

**Defense 2.A — Visible toast on active character flip**

Add `src/components/CharacterSwitchToast.tsx`. Subscribe to store changes; when `activeCharacterId` changes, render `Switched to {character.name}` for 3 seconds. Silent flips are how this bug stayed hidden — make it loud. Borrow the SyncIndicator pattern.

**Defense 2.B — Audit every `setActiveCharacter` call site**

```
grep -rn "setActiveCharacter\b" src/
```
Each call should fall into one of:
- Explicit user action ("Set as default" button) — keep
- Initial load when no character is active — keep
- Anything else — remove or gate behind explicit intent

### Tier 3 — architectural fix (when there's time)

Per-trip Supabase rows. The single `user_game_state` JSONB row holds everything; a corrupted save to it can take down all state. Per-trip rows in their own table mean a bad write to one trip can't propagate. f58b03c noted this as the right long-term fix; it still is.

### Minimum viable PR diff

| Change | File | Lines |
|---|---|---|
| `startTrip` refuses to overwrite any existing key | `src/store/useStore.ts` | ~5 |
| `setActiveCharacter` clears stale `activeTripId` | `src/store/useStore.ts` | ~7 |
| Hydrate clamps `activeTripId` to match `activeCharacterId` | `src/contexts/AuthContext.tsx` | ~5 |
| Remove auto-`setActiveCharacter` from edit-save | `src/pages/TwinEditPage.tsx` | ~3 |
| Toast on active character change | `src/components/CharacterSwitchToast.tsx` (new) + hook | ~30 |

Net diff: ~50 lines. Behavior change is small; safety guarantee is large. Once a trip exists, it can never be silently destroyed by `startTrip`, and active pointers stay consistent.

## What stays valid from today's three fixes

All three commits remain shipped and necessary:
- `9277437` — `data:` URL guard at boundary, v12 cleanup migration
- `ccc197a` — `lastLocalSave` bump on v12 + force-push flag
- `f58b03c` — chat tail cap + regenerable scene prose strip + 1.5MB hard cap with visible pill

Today's session validated the hard cap is *not* firing in this scenario — which is what it's supposed to do (only fire on size issues, not pointer drift).

## Summary for tomorrow

- Bug is in **pointer management**, not sync layer.
- User data is **fully intact** — recovered via local pointer reset.
- Real fix is upstream: **prevent silent active-character switches** and **make `startTrip` non-destructive on existing keys**.
- The `/investigate` brief is this file. Start there.
