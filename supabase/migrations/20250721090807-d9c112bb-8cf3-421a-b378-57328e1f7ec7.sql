-- Clear all likes and conversations for a fresh start
-- Delete in order to avoid foreign key constraint issues

-- Delete reviews first (depends on trade_conversations)
DELETE FROM public.reviews;

-- Delete trade messages (depends on trade_conversations)
DELETE FROM public.trade_messages;

-- Delete trade conversations
DELETE FROM public.trade_conversations;

-- Delete matches
DELETE FROM public.matches;

-- Delete liked items
DELETE FROM public.liked_items;

-- Delete notifications related to trades/likes
DELETE FROM public.notifications WHERE type IN ('match', 'like', 'trade_message', 'trade_accepted', 'trade_completed', 'friend_request');

-- Reset any sequences if needed (optional, for clean IDs)
-- Note: UUIDs don't use sequences, so this is not needed for this schema