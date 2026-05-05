# Analytics Plan — Chaptr V2

_Snapshot: 2026-05-05. Work on this tomorrow._

## TL;DR

- **Vercel Analytics / Speed Insights:** not enabled in code. May or may not be on in the Vercel dashboard — needs to be verified there.
- **Supabase event tracking:** `trackEvent()` is wired into 42 call sites across the app, but there is **no migration for the `chaptr_events` table** in `supabase/migrations/`. Inserts fail silently (try/catch with no log), so if the table was never created in the dashboard, every event has been a no-op.

## Current State

### Vercel
- No `@vercel/analytics` or `@vercel/speed-insights` package installed.
- Nothing injected in `index.html`, `src/main.tsx`, `src/App.tsx`, or `vercel.json`.
- No third-party analytics (GA, PostHog, Plausible, Mixpanel, Amplitude) anywhere.
- Vercel dashboard → Project → Analytics tab status: **unverified** (need to check manually).

### Supabase
- `src/lib/supabase.ts:20` defines:
  ```ts
  export async function trackEvent(event: string, properties: Record<string, unknown> = {}) {
    try {
      await supabase.from('chaptr_events').insert({
        event,
        properties,
        session_id: getSessionId(),
      })
    } catch {
      // Silent fail — analytics should never break the app
    }
  }
  ```
- Session ID source: `sessionStorage` key `chaptr_session`, generated with `crypto.randomUUID()` if missing.
- Migrations present in repo: `001_user_game_state`, `002_feedback`, `003_storage_buckets`, `004_sync_errors`, `005_image_cache`. **No `chaptr_events` migration.**
- The anon key is used for inserts — RLS policy needs to allow that.

### Where `trackEvent` is called (42 sites)
Grouped by feature:
- **Chat:** `chat_exchange`, `chat_action`, `group_chat_exchange`
- **Pings:** `ping_received`, `ping_opened`, `ping_reply`
- **Share:** `share_image_generated`, `share_tapped`, `share_downloaded`, `share_moment_clicked`, `share_clicked`
- **Characters:** `character_created`, `character_updated`, `character_edited`, `character_deleted`
- **Reveal:** `reveal_reached`
- **Shared reveal page:** (calls in `SharedRevealPage.tsx`)

Full list discoverable via:
```sh
grep -rn "trackEvent(" src
```

## Open Questions (resolve tomorrow)

1. Does `chaptr_events` actually exist in the Supabase project? Check via:
   ```sql
   select table_name from information_schema.tables where table_schema = 'public';
   ```
2. If it exists, are rows landing?
   ```sql
   select count(*), min(created_at), max(created_at) from chaptr_events;
   select event, count(*) from chaptr_events group by event order by 2 desc;
   ```
3. Is Vercel Web Analytics turned on in the dashboard? (Free tier covers basic page views.)
4. Do we want Speed Insights? (Separate Vercel product, paid beyond free tier.)
5. Do we want a richer product analytics tool (PostHog, Mixpanel) or is Supabase-native enough for now?

## Proposed Plan

### Step 1 — Verify what's actually live
- Open Supabase dashboard → SQL editor → run the queries above.
- Open Vercel dashboard → chaptrV2 project → Analytics tab.
- Decide: do we already have data, or have we been flying blind?

### Step 2 — If `chaptr_events` does not exist: create it
Write `supabase/migrations/006_events.sql` with:
- `id uuid primary key default gen_random_uuid()`
- `event text not null`
- `properties jsonb not null default '{}'::jsonb`
- `session_id text not null`
- `created_at timestamptz not null default now()`
- Index on `(event, created_at desc)` and `(session_id, created_at desc)`
- RLS enabled, single permissive `insert` policy for anon role, no select for anon (only service role / dashboard reads)

### Step 3 — Add Vercel Web Analytics
- `npm i @vercel/analytics`
- Mount `<Analytics />` in `src/App.tsx`
- (Optional) `@vercel/speed-insights` only if we care about Core Web Vitals trend tracking.

### Step 4 — Build a minimal dashboard view in Supabase
SQL views to start:
- DAU / WAU by `session_id` per day
- Funnel: character created → first chat exchange → reveal reached
- Top events by volume
- Share funnel: `share_tapped` → `share_image_generated` → `share_downloaded`

### Step 5 — Decide on richer tool (deferred)
Only after we see a week of clean Supabase data. Options:
- **PostHog (self-host or cloud)** — best product analytics fit for this stage, generous free tier, supports session replay
- **Mixpanel** — overkill, paid early
- **Stay Supabase-only** — cheapest, requires manual SQL for every question

## Risk Notes

- Silent fail on `trackEvent` is intentional (don't break UX) but **also masks setup bugs**. Consider adding a single `console.warn` on insert error gated behind `import.meta.env.DEV` so dev sessions show the breakage.
- Anon-key inserts to `chaptr_events` are spoofable from any browser. For revenue-grade attribution we'd need server-side events (a Vercel API route that re-emits to the same table with the service role). Not urgent for PoC-stage analytics.
- `session_id` is per-tab (sessionStorage), not per-user. Same human across tabs/devices = different sessions. Fine for now; revisit when auth is in.

## Next Action

Tomorrow morning: run the three Supabase SQL checks in Step 1, then decide between Step 2 (migration) or Step 4 (dashboard) depending on whether the table already has data.
