-- Ensure REPLICA IDENTITY FULL for support tables
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER TABLE support_conversations REPLICA IDENTITY FULL;