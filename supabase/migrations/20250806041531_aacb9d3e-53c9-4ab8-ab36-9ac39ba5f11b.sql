-- Update the delete_user_account function to handle all foreign key constraints
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get the current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to delete account';
    END IF;
    
    -- Delete user data from all related tables in correct order
    -- Delete from tables that reference other tables first
    DELETE FROM messages WHERE sender_id = current_user_id;
    DELETE FROM trade_conversations WHERE requester_id = current_user_id OR owner_id = current_user_id;
    DELETE FROM mutual_matches WHERE user1_id = current_user_id OR user2_id = current_user_id;
    DELETE FROM friend_requests WHERE requester_id = current_user_id OR recipient_id = current_user_id;
    DELETE FROM reviews WHERE user_id = current_user_id OR reviewer_id = current_user_id OR reviewee_id = current_user_id;
    DELETE FROM liked_items WHERE user_id = current_user_id;
    DELETE FROM rejections WHERE user_id = current_user_id;
    DELETE FROM notifications WHERE user_id = current_user_id;
    DELETE FROM chapter_views WHERE user_id = current_user_id;
    DELETE FROM chapter_saves WHERE user_id = current_user_id;
    DELETE FROM discussion_likes WHERE user_id = current_user_id;
    DELETE FROM discussions WHERE user_id = current_user_id;
    DELETE FROM book_follows WHERE user_id = current_user_id;
    DELETE FROM liked_vendors WHERE user_id = current_user_id;
    DELETE FROM liked_markets WHERE user_id = current_user_id;
    DELETE FROM creator_follows WHERE follower_id = current_user_id OR creator_id = current_user_id;
    DELETE FROM user_awards WHERE user_id = current_user_id;
    DELETE FROM user_earnings WHERE user_id = current_user_id;
    DELETE FROM earnings_transactions WHERE user_id = current_user_id;
    DELETE FROM creator_profiles WHERE user_id = current_user_id;
    DELETE FROM user_roles WHERE user_id = current_user_id;
    DELETE FROM items WHERE user_id = current_user_id;
    DELETE FROM profiles WHERE id = current_user_id;
    
    RAISE NOTICE 'Successfully deleted all data for user %', current_user_id;
END;
$function$;