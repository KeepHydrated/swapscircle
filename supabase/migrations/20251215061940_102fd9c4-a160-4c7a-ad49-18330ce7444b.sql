-- Delete invalid trade conversations where user is trading with themselves
DELETE FROM trade_messages WHERE conversation_id IN (
  SELECT id FROM trade_conversations WHERE requester_id = owner_id
);

DELETE FROM trade_conversations WHERE requester_id = owner_id;