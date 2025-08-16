-- Enable real-time updates for messages table
-- Set replica identity to FULL to capture complete row data during updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add messages table to the supabase_realtime publication to activate real-time functionality  
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;