-- ============================================================
-- AI Profile Setup (Updated with real UUID)
-- Sets the 'AI Intel Core' identity for a real auth user
-- ============================================================

UPDATE profiles 
SET 
  username = 'AuScope AI',
  full_name = 'AuScope Terminal AI',
  avatar_url = '/logo.svg'
WHERE id = '14a09105-4817-44a5-afae-f2fc26441d13';
