-- Telemetry table for client-side save failures.
-- Inserted by /api/log-sync-error using the service-role key.
-- Querying this table should be admin-only (RLS denies anon/authenticated reads).

create table if not exists public.sync_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  error_code text,
  error_message text not null,
  error_details text,
  classification text check (classification in ('transient', 'permanent', 'unknown')),
  state_size integer,
  user_agent text,
  client_timestamp timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists sync_errors_user_id_idx on public.sync_errors (user_id);
create index if not exists sync_errors_created_at_idx on public.sync_errors (created_at desc);
create index if not exists sync_errors_classification_idx on public.sync_errors (classification);

-- RLS: enable, but no policies for anon/authenticated. Only service-role
-- (used by /api/log-sync-error) can INSERT. Reads are admin-only via the
-- Supabase dashboard SQL editor. Bypassing RLS via service-role is
-- intentional here — the entire point of this table is to capture failures
-- that user-side RLS might cause.
alter table public.sync_errors enable row level security;

-- Useful queries to run later in the SQL editor:
--
-- Failure rate over the last hour by classification:
--   select classification, count(*) from sync_errors
--   where created_at > now() - interval '1 hour' group by classification;
--
-- Top failing users:
--   select user_id, count(*) from sync_errors
--   where created_at > now() - interval '24 hours'
--   group by user_id order by count(*) desc limit 20;
--
-- Most common error codes:
--   select error_code, count(*) from sync_errors
--   where created_at > now() - interval '24 hours'
--   group by error_code order by count(*) desc;
--
-- Payload size distribution:
--   select percentile_cont(0.5) within group (order by state_size) as p50,
--          percentile_cont(0.95) within group (order by state_size) as p95,
--          percentile_cont(0.99) within group (order by state_size) as p99,
--          max(state_size) as max from sync_errors;
