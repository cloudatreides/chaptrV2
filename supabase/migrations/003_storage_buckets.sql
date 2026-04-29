-- Storage buckets used by the app. Idempotent so safe to re-run.
-- profile-avatars: stylised selfies for player twins + remixed companions
-- chaptr-images:   AI-generated scene + portrait images persisted from Together AI

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-avatars', 'profile-avatars', true),
  ('chaptr-images',   'chaptr-images',   true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read for both buckets
DROP POLICY IF EXISTS "public read profile-avatars" ON storage.objects;
CREATE POLICY "public read profile-avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "public read chaptr-images" ON storage.objects;
CREATE POLICY "public read chaptr-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'chaptr-images');

-- Anon + authenticated write (PoC has no per-user scoping)
DROP POLICY IF EXISTS "anon write profile-avatars" ON storage.objects;
CREATE POLICY "anon write profile-avatars" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "anon write chaptr-images" ON storage.objects;
CREATE POLICY "anon write chaptr-images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'chaptr-images');

-- Allow upsert (update of existing object at same path)
DROP POLICY IF EXISTS "anon update profile-avatars" ON storage.objects;
CREATE POLICY "anon update profile-avatars" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "anon update chaptr-images" ON storage.objects;
CREATE POLICY "anon update chaptr-images" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'chaptr-images');
