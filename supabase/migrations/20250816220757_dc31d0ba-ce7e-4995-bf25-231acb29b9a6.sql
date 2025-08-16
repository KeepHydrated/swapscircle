-- Update the function to properly delete all support messages
CREATE OR REPLACE FUNCTION delete_user_support_data(target_user_id uuid DEFAULT NULL)
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
    
    -- Delete all support messages where the user is involved (either as sender or in their conversations)
    DELETE FROM support_messages 
    WHERE user_id = user_to_clean 
       OR conversation_id IN (
           SELECT id FROM support_conversations WHERE user_id = user_to_clean
       );
    
    -- Delete all support conversations for the user
    DELETE FROM support_conversations WHERE user_id = user_to_clean;
    
    RAISE NOTICE 'Successfully deleted all support data for user %', user_to_clean;
END;
$$;