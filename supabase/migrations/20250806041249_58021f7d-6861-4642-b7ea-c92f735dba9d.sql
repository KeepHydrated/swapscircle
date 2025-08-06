-- Create function to deactivate user account (admin function)
CREATE OR REPLACE FUNCTION public.deactivate_user_account(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Delete user data from all related tables
    DELETE FROM items WHERE user_id = target_user_id;
    DELETE FROM friend_requests WHERE requester_id = target_user_id OR recipient_id = target_user_id;
    DELETE FROM trade_conversations WHERE requester_id = target_user_id OR owner_id = target_user_id;
    DELETE FROM mutual_matches WHERE user1_id = target_user_id OR user2_id = target_user_id;
    DELETE FROM reviews WHERE user_id = target_user_id OR reviewer_id = target_user_id OR reviewee_id = target_user_id;
    DELETE FROM liked_items WHERE user_id = target_user_id;
    DELETE FROM rejections WHERE user_id = target_user_id;
    DELETE FROM notifications WHERE user_id = target_user_id;
    
    -- Delete the profile
    DELETE FROM profiles WHERE id = target_user_id;
    
    RAISE NOTICE 'Successfully deactivated account for user %', target_user_id;
END;
$function$;