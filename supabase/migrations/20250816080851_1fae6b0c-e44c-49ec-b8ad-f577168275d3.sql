-- Enable real-time for support tables
ALTER TABLE support_conversations REPLICA IDENTITY FULL;
ALTER TABLE support_messages REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER publication supabase_realtime ADD TABLE support_conversations;
ALTER publication supabase_realtime ADD TABLE support_messages;