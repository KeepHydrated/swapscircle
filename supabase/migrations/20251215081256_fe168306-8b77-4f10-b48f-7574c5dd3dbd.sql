-- Create test incoming trade request from umba
INSERT INTO trade_conversations (
  requester_id,
  owner_id,
  requester_item_id,
  owner_item_id,
  requester_item_ids,
  owner_item_ids,
  status,
  requester_accepted,
  owner_accepted
) VALUES (
  '1d8196ac-1e37-4582-aceb-c9141b595270',  -- umba (requester)
  'b5fbf0c4-f064-4be4-99cf-4d32a69b22fc',  -- NadiaHibrinnnn (owner - you)
  'd1c451a4-6c9b-4d02-bb10-6ff43ba7f65c',  -- Camping Tent - 4 Person
  'f7cb521b-d95f-4ab1-85df-e623b990f934',  -- Apple MacBook Pro 13"
  ARRAY['d1c451a4-6c9b-4d02-bb10-6ff43ba7f65c']::uuid[],
  ARRAY['f7cb521b-d95f-4ab1-85df-e623b990f934']::uuid[],
  'pending',
  false,  -- Initial request - neither party has accepted yet
  false
);