-- Per-user game state persistence
-- Run this in the Supabase SQL editor for project: tbrnfiixertryutrijau

CREATE TABLE IF NOT EXISTS user_game_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: users can only read/write their own state
ALTER TABLE user_game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own state"
  ON user_game_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own state"
  ON user_game_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own state"
  ON user_game_state FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
