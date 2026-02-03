-- Add tier column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free'
CHECK (tier IN ('free', 'pro'));

-- Create saved_assets table
CREATE TABLE IF NOT EXISTS saved_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('content', 'tiktok', 'youtube_shorts')),
  title TEXT,
  payload_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_assets_user_id ON saved_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_assets_channel ON saved_assets(channel);

-- RLS
ALTER TABLE saved_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assets" ON saved_assets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own assets" ON saved_assets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own assets" ON saved_assets
  FOR DELETE USING (user_id = auth.uid());
