-- Feedback table for bug reports and feature ideas
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature')),
  message TEXT NOT NULL,
  image_url TEXT,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (even if anon key is used)
CREATE POLICY "Anyone can insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Only service role can read feedback (you'll query from dashboard)
CREATE POLICY "Service role can read feedback" ON feedback
  FOR SELECT USING (auth.role() = 'service_role');
