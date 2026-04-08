-- Add created_by to channels so we can track the admin
ALTER TABLE channels ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Allow admins to delete their own channels
CREATE POLICY "Admin can delete own channel" ON channels FOR DELETE USING (auth.uid() = created_by);

-- Allow admin to remove members from their channel
CREATE POLICY "Admin can remove channel members" ON channel_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND created_by = auth.uid()) OR auth.uid() = user_id);

-- Allow anyone authenticated to insert themselves as member (join via invite)
CREATE POLICY "Users can insert themselves as member" ON channel_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
