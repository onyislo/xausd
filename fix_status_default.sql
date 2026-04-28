-- ============================================================
-- FIX: profiles.status always showing 'online'
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Remove the bad default ('online') — set it to 'offline'
ALTER TABLE public.profiles 
  ALTER COLUMN status SET DEFAULT 'offline';

-- 2. Reset ALL existing rows to 'offline'
--    The app code will set them back to 'online' when the user logs in.
UPDATE public.profiles SET status = 'offline';

-- Done! Status will now only be 'online' when the user actively signs in.
