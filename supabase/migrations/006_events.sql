-- Client-side product analytics events.
-- Inserted directly from the browser via the anon key in src/lib/supabase.ts (trackEvent).
-- Reads are admin-only via the Supabase dashboard (no select policy for anon/authenticated).
--
-- Idempotent: safe to run even if the table was previously created via the dashboard.

create table if not exists public.chaptr_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  properties jsonb not null default '{}'::jsonb,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists chaptr_events_event_created_at_idx
  on public.chaptr_events (event, created_at desc);
create index if not exists chaptr_events_session_created_at_idx
  on public.chaptr_events (session_id, created_at desc);

alter table public.chaptr_events enable row level security;

-- Allow the anon role to insert events from the browser. No select / update / delete
-- policies are defined, so reads happen only via the dashboard / service role.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'chaptr_events'
      and policyname = 'chaptr_events_anon_insert'
  ) then
    create policy chaptr_events_anon_insert
      on public.chaptr_events
      for insert
      to anon, authenticated
      with check (true);
  end if;
end$$;

-- Useful queries to run later in the SQL editor:
--
-- Event volume by day:
--   select date_trunc('day', created_at) as day, count(*)
--   from chaptr_events group by 1 order by 1 desc;
--
-- Top events:
--   select event, count(*) from chaptr_events
--   group by event order by 2 desc;
--
-- DAU (per session_id, not per user — revisit when auth is wired in):
--   select date_trunc('day', created_at) as day, count(distinct session_id) as dau
--   from chaptr_events group by 1 order by 1 desc;
--
-- Share funnel:
--   select event, count(*) from chaptr_events
--   where event in ('share_tapped', 'share_image_generated', 'share_downloaded')
--   group by event;
