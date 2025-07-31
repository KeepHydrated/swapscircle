-- Delete all messages in conversations where the user is involved
DELETE FROM messages 
WHERE conversation_id IN (
  SELECT id FROM trade_conversations 
  WHERE requester_id = '2f3aeee8-c5a3-4fac-80ad-653355be1e53' 
     OR owner_id = '2f3aeee8-c5a3-4fac-80ad-653355be1e53'
);

-- Delete all trade conversations where the user is involved
DELETE FROM trade_conversations 
WHERE requester_id = '2f3aeee8-c5a3-4fac-80ad-653355be1e53' 
   OR owner_id = '2f3aeee8-c5a3-4fac-80ad-653355be1e53';

-- Delete all mutual matches involving the user
DELETE FROM mutual_matches 
WHERE user1_id = '2f3aeee8-c5a3-4fac-80ad-653355be1e53' 
   OR user2_id = '2f3aeee8-c5a3-4fac-80ad-653355be1e53';