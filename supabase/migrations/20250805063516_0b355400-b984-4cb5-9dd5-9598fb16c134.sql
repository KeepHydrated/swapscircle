-- Create function to clean up user data for fresh start
CREATE OR REPLACE FUNCTION public.cleanup_user_data(target_user_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    cleanup_user_id UUID;
BEGIN
    -- Use provided user_id or current authenticated user
    cleanup_user_id := COALESCE(target_user_id, auth.uid());
    
    IF cleanup_user_id IS NULL THEN
        RAISE EXCEPTION 'No user specified and no authenticated user found';
    END IF;
    
    -- Delete user's trade conversations and related messages
    -- Messages will be deleted by cascade when conversations are deleted
    DELETE FROM trade_conversations 
    WHERE requester_id = cleanup_user_id OR owner_id = cleanup_user_id;
    
    -- Delete mutual matches involving the user
    DELETE FROM mutual_matches 
    WHERE user1_id = cleanup_user_id OR user2_id = cleanup_user_id;
    
    -- Delete friend requests involving the user
    DELETE FROM friend_requests 
    WHERE requester_id = cleanup_user_id OR recipient_id = cleanup_user_id;
    
    -- Delete reviews by or for the user
    DELETE FROM reviews 
    WHERE user_id = cleanup_user_id OR reviewer_id = cleanup_user_id OR reviewee_id = cleanup_user_id;
    
    -- Delete user's items (this should be done last due to foreign key dependencies)
    DELETE FROM items 
    WHERE user_id = cleanup_user_id;
    
    RAISE NOTICE 'Successfully cleaned up data for user %', cleanup_user_id;
END;
$$;

-- Create function to cleanup ALL data (use with extreme caution)
CREATE OR REPLACE FUNCTION public.cleanup_all_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only allow this if user is authenticated (safety check)
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Must be authenticated to perform cleanup';
    END IF;
    
    -- Delete all trade-related data in order
    DELETE FROM messages;
    DELETE FROM trade_conversations;
    DELETE FROM mutual_matches;
    DELETE FROM reviews;
    DELETE FROM friend_requests;
    DELETE FROM items;
    
    RAISE NOTICE 'Successfully cleaned up ALL data from the database';
END;
$$;