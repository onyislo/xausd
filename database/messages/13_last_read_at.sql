-- Add last_read_at to track when a user last read a channel
ALTER TABLE channel_members ADD COLUMN IF NOT EXISTS last_read_at timestamptz DEFAULT now();
