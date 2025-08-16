-- Ensure replica identity is set to FULL for both tables
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER TABLE support_conversations REPLICA IDENTITY FULL;