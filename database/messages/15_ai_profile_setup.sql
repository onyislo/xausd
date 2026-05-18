-- ============================================================
-- AI Profile Setup (Updated with real UUID)
-- Sets the 'AI Intel Core' identity for a real auth user
-- ============================================================

UPDATE profiles 
SET 
  username = 'AuScope AI',
  full_name = 'AuScope Terminal AI',
  avatar_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=AuScope%20AI&backgroundColor=0f172a',
  updated_at = now()
WHERE id = '14a09105-4817-44a5-afae-f2fc26441d13';
