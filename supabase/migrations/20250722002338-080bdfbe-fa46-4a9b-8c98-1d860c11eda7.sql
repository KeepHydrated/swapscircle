-- Clear all likes, conversations, messages, matches, and notifications for a fresh start

-- Delete all trade messages first (foreign key constraint)
DELETE FROM trade_messages;

-- Delete all trade conversations
DELETE FROM trade_conversations;

-- Delete all liked items
DELETE FROM liked_items;

-- Delete all matches
DELETE FROM matches;

-- Delete all notifications
DELETE FROM notifications;

-- Reset any items back to available status (in case some were marked unavailable)
UPDATE items SET is_available = true WHERE is_available = false;