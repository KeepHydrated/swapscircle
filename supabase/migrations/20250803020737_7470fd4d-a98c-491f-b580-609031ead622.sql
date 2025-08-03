-- Delete all trade-related data and items to start fresh
-- First delete messages (references trade_conversations)
DELETE FROM messages WHERE conversation_id IN (SELECT id FROM trade_conversations);

-- Delete trade conversations (references items)
DELETE FROM trade_conversations;

-- Delete mutual matches (references items)
DELETE FROM mutual_matches;

-- Delete reviews that reference trade conversations
DELETE FROM reviews WHERE trade_conversation_id IS NOT NULL;

-- Now delete all items
DELETE FROM items;