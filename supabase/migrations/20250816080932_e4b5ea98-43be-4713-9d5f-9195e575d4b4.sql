-- Ensure REPLICA IDENTITY FULL is set for support tables
ALTER TABLE support_conversations REPLICA IDENTITY FULL;
ALTER TABLE support_messages REPLICA IDENTITY FULL;