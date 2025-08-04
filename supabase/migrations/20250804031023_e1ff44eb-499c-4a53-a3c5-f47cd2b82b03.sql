-- Fix the security issue by adding proper search_path
CREATE OR REPLACE FUNCTION check_draft_limit()
RETURNS TRIGGER AS $$
DECLARE
    draft_count INTEGER;
BEGIN
    -- Only check for draft items
    IF NEW.status = 'draft' THEN
        -- Count existing draft items for this user
        SELECT COUNT(*)
        INTO draft_count
        FROM items
        WHERE user_id = NEW.user_id AND status = 'draft';
        
        -- If user already has 10 or more drafts, prevent insertion
        IF draft_count >= 10 THEN
            RAISE EXCEPTION 'You cannot have more than 10 draft items. Please publish or delete some drafts before creating new ones.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';