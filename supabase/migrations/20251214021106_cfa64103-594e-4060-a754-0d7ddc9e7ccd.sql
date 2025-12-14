-- Create a sample trade request from a different user (Camping Tent owner) wanting to trade for your Test item
INSERT INTO trade_conversations (
  requester_id,
  owner_id,
  requester_item_id,
  owner_item_id,
  status,
  requester_accepted,
  owner_accepted,
  requester_item_ids
) VALUES (
  '1d8196ac-1e37-4582-aceb-c9141b595270', -- Camping Tent owner (requester)
  'b5fbf0c4-f064-4be4-99cf-4d32a69b22fc', -- You (owner)
  'd1c451a4-6c9b-4d02-bb10-6ff43ba7f65c', -- Camping Tent - 4 Person
  'eead1e22-ef2f-4fba-8230-0e52812aa1ba', -- Your "Test (Copy)" item
  'pending',
  false,
  false,
  ARRAY['d1c451a4-6c9b-4d02-bb10-6ff43ba7f65c']::uuid[]
);