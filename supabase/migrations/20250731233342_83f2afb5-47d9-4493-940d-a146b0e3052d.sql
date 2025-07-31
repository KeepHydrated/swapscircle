-- Clean up user data for fresh start
-- This will delete likes, conversations, messages, matches, and rejections for the current user

-- Delete liked items by current user
DELETE FROM liked_items WHERE user_id = auth.uid();

-- Delete rejections by current user  
DELETE FROM rejections WHERE user_id = auth.uid();

-- Delete mutual matches where current user is involved
DELETE FROM mutual_matches WHERE user1_id = auth.uid() OR user2_id = auth.uid();

-- Delete messages in conversations where current user is involved
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM trade_conversations 
  WHERE requester_id = auth.uid() OR owner_id = auth.uid()
);

-- Delete trade conversations where current user is involved
DELETE FROM trade_conversations WHERE requester_id = auth.uid() OR owner_id = auth.uid();