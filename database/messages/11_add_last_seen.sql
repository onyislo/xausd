-- ============================================================
-- QUERY 11: Add last_seen to Profiles
-- Run this to enable the "last seen" timestamp tracking.
-- ============================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
