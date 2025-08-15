-- Ensure support_messages table is added to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.support_messages;