-- Comprehensive update to delete_user_account function to handle ALL user references
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
    -- Delete from dependent tables first to avoid foreign key violations
    
    -- Comment-related tables
    DELETE FROM submission_comment_likes WHERE user_id = current_user_id;
    DELETE FROM task_comment_likes WHERE user_id = current_user_id;
    DELETE FROM submission_comments WHERE user_id = current_user_id;
    DELETE FROM task_comments WHERE user_id = current_user_id;
    
    -- Submission and task related
    DELETE FROM submission_likes WHERE user_id = current_user_id;
    DELETE FROM task_likes WHERE user_id = current_user_id;
    DELETE FROM product_submissions WHERE user_id = current_user_id;
    DELETE FROM task_submissions WHERE creator_id = current_user_id;
    DELETE FROM offers WHERE user_id = current_user_id;
    
    -- Product and review related
    DELETE FROM product_reviews WHERE user_id = current_user_id;
    DELETE FROM recipes WHERE user_id = current_user_id;
    DELETE FROM affiliate_links WHERE user_id = current_user_id;
    
    -- Book and chapter related
    DELETE FROM chapter_reactions WHERE user_id = current_user_id;
    DELETE FROM chapter_views WHERE user_id = current_user_id;
    DELETE FROM chapter_saves WHERE user_id = current_user_id;
    DELETE FROM discussion_likes WHERE user_id = current_user_id;
    DELETE FROM discussions WHERE user_id = current_user_id;
    DELETE FROM book_follows WHERE user_id = current_user_id;
    DELETE FROM book_requests WHERE created_by = current_user_id;
    DELETE FROM books WHERE created_by = current_user_id;
    
    -- Messaging and conversations
    DELETE FROM trade_messages WHERE sender_id = current_user_id;
    DELETE FROM messages WHERE sender_id = current_user_id;
    DELETE FROM trade_conversations WHERE requester_id = current_user_id OR owner_id = current_user_id;
    DELETE FROM trades WHERE requester_id = current_user_id OR owner_id = current_user_id;
    
    -- Matches and relationships
    DELETE FROM mutual_matches WHERE user1_id = current_user_id OR user2_id = current_user_id;
    DELETE FROM friend_requests WHERE requester_id = current_user_id OR recipient_id = current_user_id;
    DELETE FROM creator_follows WHERE follower_id = current_user_id OR creator_id = current_user_id;
    
    -- Reviews and ratings
    DELETE FROM reviews WHERE user_id = current_user_id OR reviewer_id = current_user_id OR reviewee_id = current_user_id;
    
    -- Liked items and preferences
    DELETE FROM liked_items WHERE user_id = current_user_id;
    DELETE FROM liked_vendors WHERE user_id = current_user_id;
    DELETE FROM liked_markets WHERE user_id = current_user_id;
    DELETE FROM liked_websites WHERE user_id = current_user_id;
    DELETE FROM rejections WHERE user_id = current_user_id;
    
    -- Tasks and creator related
    DELETE FROM tasks WHERE creator_id = current_user_id;
    DELETE FROM creator_categories WHERE creator_id = current_user_id;
    
    -- Notifications and reports
    DELETE FROM notifications WHERE user_id = current_user_id;
    DELETE FROM reports WHERE reporter_id = current_user_id;
    
    -- Awards and earnings
    DELETE FROM user_awards WHERE user_id = current_user_id;
    DELETE FROM earnings_transactions WHERE user_id = current_user_id;
    DELETE FROM user_earnings WHERE user_id = current_user_id;
    
    -- Submissions and related data
    DELETE FROM submissions WHERE created_by = current_user_id OR reviewed_by = current_user_id;
    
    -- Creator profile and roles
    DELETE FROM creator_profiles WHERE user_id = current_user_id;
    DELETE FROM user_roles WHERE user_id = current_user_id OR created_by = current_user_id;
    
    -- User items and main profile (delete last)
    DELETE FROM items WHERE user_id = current_user_id;
    DELETE FROM profiles WHERE id = current_user_id;
    
    RAISE NOTICE 'Successfully deleted all data for user %', current_user_id;
END;
$function$;