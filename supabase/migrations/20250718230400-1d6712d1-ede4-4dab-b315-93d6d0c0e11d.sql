-- Delete all trade messages first
DELETE FROM public.trade_messages;

-- Delete all trade conversations
DELETE FROM public.trade_conversations;

-- Delete all liked items
DELETE FROM public.liked_items;

-- Delete all matches
DELETE FROM public.matches;

-- Now delete all items
DELETE FROM public.items;