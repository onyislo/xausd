-- ============================================================
-- AI Profile Setup
-- Creates a system-level AI profile for the chat assistant
-- ============================================================

INSERT INTO profiles (id, username, full_name, avatar_url, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Static UUID for the AI system
  'AI_INTEL_CORE',
  'AI Intel Core',
  'https://api.dicebear.com/7.x/bottts/svg?seed=AI_INTEL_CORE&backgroundColor=0f172a',
  now()
)
ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();
