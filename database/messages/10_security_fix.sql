-- ============================================================
-- QUERY 10: Security Fix for Channels & Messages
-- Run this to restrict access to private communications.
-- ============================================================

-- Drop permissive policies
DROP POLICY IF EXISTS "authenticated users can view all channels" ON channels;
DROP POLICY IF EXISTS "authenticated users can view channel members" ON channel_members;
DROP POLICY IF EXISTS "authenticated users can view messages" ON messages;

-- Secure Channels: View only if member
CREATE POLICY "Users can view channels they are members of"
  ON channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members 
      WHERE channel_members.channel_id = id 
      AND channel_members.user_id = auth.uid()
    )
  );

-- Secure Channel Members: View only if member of same channel
CREATE POLICY "Users can view members of their own channels"
  ON channel_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members AS self
      WHERE self.channel_id = channel_members.channel_id 
      AND self.user_id = auth.uid()
    )
  );

-- Secure Messages: View only if member of the channel
CREATE POLICY "Users can view messages in their channels"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members 
      WHERE channel_members.channel_id = messages.channel_id 
      AND channel_members.user_id = auth.uid()
    )
  );

-- Ensure users can only send messages to channels they are members of
DROP POLICY IF EXISTS "authenticated users can send messages" ON messages;
CREATE POLICY "Users can send messages to their channels"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM channel_members 
      WHERE channel_members.channel_id = messages.channel_id 
      AND channel_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- FIX CHANNEL MEMBERS INSERT
-- Allow users to add other users (required for creating DMs and Groups)
-- ============================================================
DROP POLICY IF EXISTS "authenticated users can join channels" ON channel_members;
CREATE POLICY "users can add members to channels"
  ON channel_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- DEDICATED DM LOOKUP TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS direct_message_lookup (
  user_a UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_a, user_b)
);

-- Enable RLS
ALTER TABLE direct_message_lookup ENABLE ROW LEVEL SECURITY;

-- Users can only see DM lookups they are part of
CREATE POLICY "Users can view their own DM lookups"
  ON direct_message_lookup FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can insert DM lookups they are part of
CREATE POLICY "Users can insert their own DM lookups"
  ON direct_message_lookup FOR INSERT
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);
