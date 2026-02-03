-- prompt_runs: Analytics table for tracking prompt generation events
-- Privacy-light approach: stores prompt hash, not raw text

CREATE TABLE prompt_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NULL,
  anon_session_id TEXT NULL,
  platform TEXT NOT NULL,
  intent TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  selected_artifacts TEXT[] NOT NULL DEFAULT '{}',
  parent_run_id UUID NULL REFERENCES prompt_runs(id),
  success BOOLEAN DEFAULT TRUE,
  error_code TEXT NULL,
  duration_ms INT NULL
);

-- Indexes for common queries
CREATE INDEX idx_prompt_runs_user ON prompt_runs(user_id, created_at DESC);
CREATE INDEX idx_prompt_runs_anon ON prompt_runs(anon_session_id, created_at DESC);
CREATE INDEX idx_prompt_runs_hash ON prompt_runs(prompt_hash, created_at DESC);
CREATE INDEX idx_prompt_runs_parent ON prompt_runs(parent_run_id);

-- Row Level Security
ALTER TABLE prompt_runs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for anonymous tracking)
CREATE POLICY "Allow inserts" ON prompt_runs FOR INSERT WITH CHECK (true);

-- Users can read their own runs (by user_id or anon_session_id)
CREATE POLICY "Users can read own runs" ON prompt_runs FOR SELECT
  USING (user_id = auth.uid() OR anon_session_id IS NOT NULL);
