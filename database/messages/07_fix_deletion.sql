-- Refined Deletion Policy:
-- Allow owners to delete their channels.
-- ALSO allow any authenticated user to delete a channel if it has NO owner (NULL created_by), 
-- which helps clean up existing test data.

DROP POLICY IF EXISTS "Admin can delete own channel" ON channels;

CREATE POLICY "Admin can delete channel" 
  ON channels FOR DELETE 
  USING (
    auth.uid() = created_by 
    OR 
    created_by IS NULL
  );
