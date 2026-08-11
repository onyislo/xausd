-- ==============================================================================
-- STRICT DATABASE LIMITS FOR GROUPS (HUBS)
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. TRIGGER: Enforce Maximum 10 Groups per User
-- This absolutely prevents any operative from creating more than 10 groups, 
-- even if they try to bypass the frontend.
CREATE OR REPLACE FUNCTION enforce_max_groups_per_user()
RETURNS TRIGGER AS $$
DECLARE
    group_count INT;
BEGIN
    -- Only check if they are creating a 'group'
    IF NEW.type = 'group' THEN
        SELECT COUNT(*) INTO group_count 
        FROM channels 
        WHERE created_by = NEW.created_by AND type = 'group';

        IF group_count >= 10 THEN
            RAISE EXCEPTION 'MAXIMUM 10 HUBS AUTHORIZED PER OPERATIVE. Database insertion blocked.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_max_groups ON channels;
CREATE TRIGGER trigger_enforce_max_groups
BEFORE INSERT ON channels
FOR EACH ROW
EXECUTE FUNCTION enforce_max_groups_per_user();


-- 2. TRIGGER: Enforce Maximum 30,000 Members per Group
-- This prevents any group from exceeding the absolute capacity limit.
CREATE OR REPLACE FUNCTION enforce_max_members_per_group()
RETURNS TRIGGER AS $$
DECLARE
    member_count INT;
BEGIN
    SELECT COUNT(*) INTO member_count 
    FROM channel_members 
    WHERE channel_id = NEW.channel_id;

    IF member_count >= 30000 THEN
        RAISE EXCEPTION 'HUB IS AT MAXIMUM CAPACITY (30,000). Database insertion blocked.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_max_members ON channel_members;
CREATE TRIGGER trigger_enforce_max_members
BEFORE INSERT ON channel_members
FOR EACH ROW
EXECUTE FUNCTION enforce_max_members_per_group();
