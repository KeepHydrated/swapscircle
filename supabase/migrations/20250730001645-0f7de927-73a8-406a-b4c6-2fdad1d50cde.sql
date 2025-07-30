-- Create a function to handle account deletion
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get the current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to delete account';
    END IF;
    
    -- Delete user data from all related tables
    -- Delete from items table
    DELETE FROM items WHERE user_id = current_user_id;
    
    -- Delete from friend_requests table
    DELETE FROM friend_requests WHERE requester_id = current_user_id OR recipient_id = current_user_id;
    
    -- Delete from trade_conversations table
    DELETE FROM trade_conversations WHERE requester_id = current_user_id OR owner_id = current_user_id;
    
    -- Delete from messages table (will be handled by trade_conversations cascade)
    
    -- Delete from mutual_matches table
    DELETE FROM mutual_matches WHERE user1_id = current_user_id OR user2_id = current_user_id;
    
    -- Delete from reviews table
    DELETE FROM reviews WHERE user_id = current_user_id OR reviewer_id = current_user_id OR reviewee_id = current_user_id;
    
    -- Delete from profiles table
    DELETE FROM profiles WHERE id = current_user_id;
    
    -- Note: The auth.users deletion needs to be handled by an admin function
    -- For now, we'll mark the profile as deleted and let the user sign out
END;
$$;