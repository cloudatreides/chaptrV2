-- Cross-user image cache. Used by src/lib/togetherAi.ts to dedupe prompt-only
-- scene generations (city skylines, generic backgrounds). When a generation's
-- prompt+refs hash already lives here, we serve the cached Supabase storage URL
-- instead of paying for another Gemini call.
--
-- Cache is intentionally global (not per-user). A "Bangkok at golden hour"
-- prompt produces functionally equivalent anime art for everyone, so sharing
-- saves $0.039 per re-hit. The image bytes still live in chaptr-images
-- storage; only the lookup is in this table.
--
-- Idempotent so safe to re-run.

CREATE TABLE IF NOT EXISTS chaptr_image_cache (
  prompt_hash    text PRIMARY KEY,
  image_url      text NOT NULL,
  prompt_preview text,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_image_cache_created_at
  ON chaptr_image_cache (created_at DESC);

ALTER TABLE chaptr_image_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read image cache" ON chaptr_image_cache;
CREATE POLICY "public read image cache" ON chaptr_image_cache
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon write image cache" ON chaptr_image_cache;
CREATE POLICY "anon write image cache" ON chaptr_image_cache
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow upsert (same prompt_hash re-cached) — the URL only changes if a user
-- regenerates and the cached image is no longer reachable.
DROP POLICY IF EXISTS "anon update image cache" ON chaptr_image_cache;
CREATE POLICY "anon update image cache" ON chaptr_image_cache
  FOR UPDATE TO anon, authenticated
  USING (true);
