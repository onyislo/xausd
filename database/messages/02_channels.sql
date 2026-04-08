-- ============================================================
-- QUERY 2: Channels & Channel Members Tables
-- Run AFTER 01_profiles.sql
-- ============================================================

-- Channels: can be a DM or a Group
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,  -- NULL for DMs, has a name for Groups
  type TEXT DEFAULT 'dm' CHECK (type IN ('dm', 'group')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Channel Members: which users belong to which channel
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(channel_id, user_id)
);
