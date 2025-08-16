-- Add support_conversations table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE support_conversations;

-- Make sure both tables have REPLICA IDENTITY FULL for complete real-time data
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER TABLE support_conversations REPLICA IDENTITY FULL;