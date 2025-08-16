-- Enable realtime for support tables
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER TABLE support_conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_conversations;

-- Enable realtime for messages and trade conversations tables (for general chat)
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE trade_conversations REPLICA IDENTITY FULL;

-- Add chat tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE trade_conversations;