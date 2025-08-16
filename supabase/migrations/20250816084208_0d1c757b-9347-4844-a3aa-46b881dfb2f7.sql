-- Enable real-time for support_messages table
ALTER TABLE support_messages REPLICA IDENTITY FULL;

-- Add support_messages to the realtime publication
ALTER publication supabase_realtime ADD TABLE support_messages;

-- Also enable for support_conversations table
ALTER TABLE support_conversations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE support_conversations;