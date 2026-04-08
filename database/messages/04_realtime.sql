-- ============================================================
-- QUERY 4: Enable Real-Time Subscriptions
-- Run AFTER 03_messages.sql
-- ============================================================

-- Allow the app to listen for live message and profile updates
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
