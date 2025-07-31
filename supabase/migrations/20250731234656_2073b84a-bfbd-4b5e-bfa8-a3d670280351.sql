-- Clean up all user data for fresh start
-- This will delete likes, conversations, matches, and rejections

-- Delete all liked items for the current user
DELETE FROM liked_items WHERE user_id = auth.uid();

-- Delete all trade conversations where user is either requester or owner
-- This will cascade delete all messages in those conversations
DELETE FROM trade_conversations 
WHERE requester_id = auth.uid() OR owner_id = auth.uid();

-- Delete all mutual matches involving the current user
DELETE FROM mutual_matches 
WHERE user1_id = auth.uid() OR user2_id = auth.uid();

-- Delete all rejections by the current user (both item-specific and global)
DELETE FROM rejections WHERE user_id = auth.uid();