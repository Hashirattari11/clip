-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This creates the jobs table for video history

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  message TEXT DEFAULT '',
  clips JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow all operations (simpler for MVP)
-- For production, add proper auth policies
CREATE POLICY "Allow all operations" ON jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
