-- Pre-GTM security hardening.
-- Run in Supabase SQL editor for project: tbrnfiixertryutrijau
--
-- 1. Storage buckets: drop anon writes; restrict to authenticated users with
--    per-user path scoping. Anon write was a PoC-era policy that turned the
--    public buckets into an open file dump.
-- 2. chaptr_image_cache: drop anon UPDATE so attackers can't poison cached
--    image_url after a row is created. Inserts still allowed (first-write
--    wins). Reads stay public.

-- ─── Storage: profile-avatars ───
-- Path convention enforced by client: selfies/{uuid}.png today; we want to
-- migrate to {user_id}/selfies/{uuid}.png so the path's first segment is the
-- user id. Until call sites are updated, we accept either:
--   (a) path starts with user.id::text, OR
--   (b) the legacy `selfies/` prefix from authenticated users (scoped to a
--       random per-character UUID, unguessable so cross-user overwrite risk
--       is bounded).
-- TODO post-GTM: migrate call sites to user-scoped paths and tighten to (a) only.

DROP POLICY IF EXISTS "anon write profile-avatars" ON storage.objects;
DROP POLICY IF EXISTS "anon update profile-avatars" ON storage.objects;

CREATE POLICY "auth write profile-avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (storage.foldername(name))[1] = 'selfies'
    )
  );

CREATE POLICY "auth update profile-avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (storage.foldername(name))[1] = 'selfies'
    )
  );

-- ─── Storage: chaptr-images ───
-- togetherAi.ts already builds `users/{user_id}/...` paths for authenticated
-- callers (see getStoragePathPrefix). Enforce that as the only writable path.

DROP POLICY IF EXISTS "anon write chaptr-images" ON storage.objects;
DROP POLICY IF EXISTS "anon update chaptr-images" ON storage.objects;

CREATE POLICY "auth write chaptr-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chaptr-images'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "auth update chaptr-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'chaptr-images'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- ─── chaptr_image_cache: kill UPDATE ───
-- Anon UPDATE was the cache-poisoning vector. Inserts only — the rare
-- "regenerate replaces stale URL" path is acceptable to lose; clients can
-- write under a new prompt_hash if a refresh is needed.

DROP POLICY IF EXISTS "anon update image cache" ON public.chaptr_image_cache;
