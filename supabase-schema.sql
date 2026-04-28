-- ============================================================
-- SYSTEM OS — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User state (single JSON blob per user — simple and fast)
CREATE TABLE IF NOT EXISTS user_state (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state_json  TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: users can only access their own data
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own state" ON user_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own state" ON user_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own state" ON user_state
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- SETUP INSTRUCTIONS
-- ============================================================
-- 1. Go to https://supabase.com and create a free project
-- 2. Open SQL Editor → paste this file → Run
-- 3. Go to Settings → API → copy Project URL and anon key
-- 4. In System OS → Settings → Cloud Sync → paste both
-- 5. Sync dot turns green when connected
-- ============================================================
