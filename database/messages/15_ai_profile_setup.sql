-- ============================================================
-- AI Profile Setup (Updated with real UUID)
-- Sets the 'AI Intel Core' identity for a real auth user
-- ============================================================

UPDATE profiles 
SET 
  username = 'AI_INTEL_CORE',
  full_name = 'AI Intel Core',
  avatar_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=AI_INTEL_CORE&backgroundColor=0f172a',
  updated_at = now()
WHERE id = '14a09105-4817-44a5-afae-f2fc26441d13';
