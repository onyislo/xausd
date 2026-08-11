-- ==========================================
-- GROUP INVITE LINKS & AUTO-GENERATION LOGIC
-- ==========================================

-- 1. Add an invite_token column to the channels table
ALTER TABLE channels ADD COLUMN IF NOT EXISTS invite_token VARCHAR(20) UNIQUE;

-- 2. Create a function to auto-generate a secure 8-character token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TRIGGER AS $$
DECLARE
    new_token VARCHAR(20);
    is_unique BOOLEAN := FALSE;
BEGIN
    -- We only generate invite links for 'group' type channels
    IF NEW.type = 'group' THEN
        WHILE NOT is_unique LOOP
            -- Generate a random 8-character alphanumeric string
            new_token := substring(md5(random()::text), 1, 8);
            
            -- Ensure it is strictly unique across the database
            PERFORM 1 FROM channels WHERE invite_token = new_token;
            IF NOT FOUND THEN
                is_unique := TRUE;
            END IF;
        END LOOP;
        
        NEW.invite_token := new_token;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach the trigger to fire BEFORE INSERT on channels
DROP TRIGGER IF EXISTS trigger_auto_generate_invite_token ON channels;
CREATE TRIGGER trigger_auto_generate_invite_token
    BEFORE INSERT ON channels
    FOR EACH ROW
    EXECUTE FUNCTION generate_invite_token();

-- 4. Backfill existing groups (give tokens to groups that were already created)
UPDATE channels 
SET invite_token = substring(md5(random()::text), 1, 8) 
WHERE type = 'group' AND invite_token IS NULL;

-- ==========================================
-- END OF SCRIPT
-- ==========================================
