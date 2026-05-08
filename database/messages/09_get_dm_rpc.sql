-- ============================================================
-- SQL for get_dm_channel RPC
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION get_dm_channel(user_a UUID, user_b UUID)
RETURNS TABLE (id UUID, type TEXT) AS $$
BEGIN
  -- Security check: The caller must be either user_a or user_b
  IF auth.uid() <> user_a AND auth.uid() <> user_b THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id, c.type
  FROM channels c
  JOIN channel_members cm1 ON c.id = cm1.channel_id
  JOIN channel_members cm2 ON c.id = cm2.channel_id
  WHERE c.type = 'dm'
    AND cm1.user_id = user_a
    AND cm2.user_id = user_b;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
