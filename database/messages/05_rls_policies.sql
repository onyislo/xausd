-- ============================================================
-- QUERY 5: Row Level Security (RLS) Policies
-- Run LAST — fixes 403 Forbidden errors on channel creation.
-- ============================================================

-- CHANNELS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can create channels"
  ON channels FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated users can view all channels"
  ON channels FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- CHANNEL MEMBERS
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can join channels"
  ON channel_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated users can view channel members"
  ON channel_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated users can view messages"
  ON messages FOR SELECT
  USING (auth.uid() IS NOT NULL);
