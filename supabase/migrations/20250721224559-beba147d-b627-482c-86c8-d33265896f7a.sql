-- Clear all data to start fresh
-- Delete in order to respect foreign key constraints

-- Delete reviews first (references trade_conversations)
DELETE FROM public.reviews;

-- Delete trade messages (references trade_conversations)
DELETE FROM public.trade_messages;

-- Delete trade conversations
DELETE FROM public.trade_conversations;

-- Delete matches
DELETE FROM public.matches;

-- Delete liked items
DELETE FROM public.liked_items;