-- Enable real-time for support tables
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER TABLE support_conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_conversations;