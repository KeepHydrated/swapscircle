-- Delete all trade messages first (due to foreign key dependencies)
DELETE FROM public.trade_messages;

-- Delete all trade conversations
DELETE FROM public.trade_conversations;

-- Delete all liked items
DELETE FROM public.liked_items;

-- Delete all matches
DELETE FROM public.matches;