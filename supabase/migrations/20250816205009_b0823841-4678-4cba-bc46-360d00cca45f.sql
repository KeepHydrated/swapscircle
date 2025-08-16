-- Enable real-time for support_messages table
ALTER TABLE support_messages REPLICA IDENTITY FULL;

-- Add support_messages to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- Also make sure support_conversations is enabled for real-time
ALTER TABLE support_conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE support_conversations;