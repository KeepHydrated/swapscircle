-- Delete all data to start fresh
-- Delete in the correct order to avoid foreign key constraint issues

-- Delete all messages first (they reference trade_conversations)
DELETE FROM messages;

-- Delete all trade conversations
DELETE FROM trade_conversations;

-- Delete all mutual matches
DELETE FROM mutual_matches;

-- Delete all reviews
DELETE FROM reviews;

-- Delete all friend requests
DELETE FROM friend_requests;

-- Delete all items
DELETE FROM items;

-- Reset any sequences if needed (though we're using UUIDs, so this shouldn't be necessary)
-- But let's also clear any notification data related to these items
DELETE FROM notifications WHERE type = 'comment' AND action_taken IN ('match', 'friend', 'message');