-- Create a function to delete all notifications for a user
CREATE OR REPLACE FUNCTION delete_user_notifications(target_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_to_clean uuid;
BEGIN
    -- Use provided user_id or current authenticated user
    user_to_clean := COALESCE(target_user_id, auth.uid());
    
    IF user_to_clean IS NULL THEN
        RAISE EXCEPTION 'No user specified and no authenticated user found';
    END IF;
    
    -- Delete all notifications for the user
    DELETE FROM notifications WHERE user_id = user_to_clean;
    
    RAISE NOTICE 'Successfully deleted all notifications for user %', user_to_clean;
END;
$$;