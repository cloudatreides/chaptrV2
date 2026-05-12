-- Link analytics events to auth users so we can compute real "last active"
-- per user. Before this, chaptr_events were only keyed by session_id, so a
-- returning user (already signed-in session) was indistinguishable from the
-- person they signed up as — the admin dashboard fell back to
-- auth.users.last_sign_in_at, which only updates on a fresh sign-in flow.
--
-- Nullable: keeps anonymous landing-page events (no session yet) working,
-- and avoids breaking any client that hasn't shipped the new trackEvent yet.

alter table public.chaptr_events
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists chaptr_events_user_id_created_at_idx
  on public.chaptr_events (user_id, created_at desc)
  where user_id is not null;
