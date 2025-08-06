-- Delete all trade-related data to start fresh
DELETE FROM messages;
DELETE FROM trade_conversations; 
DELETE FROM mutual_matches;
DELETE FROM reviews;
DELETE FROM friend_requests;
DELETE FROM items;
DELETE FROM liked_items;
DELETE FROM rejections;
DELETE FROM notifications;