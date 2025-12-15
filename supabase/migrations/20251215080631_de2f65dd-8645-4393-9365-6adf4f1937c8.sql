-- Create test incoming trade where NadiaHibrinnnn receives a trade request
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
  '1611ee2b-ab23-493d-9567-82dba0a81991',  -- Aneesha D (requester)
  'b5fbf0c4-f064-4be4-99cf-4d32a69b22fc',  -- NadiaHibrinnnn (owner - you)
  'c5d82e36-ec10-4094-a694-c0e02891e2e6',  -- Trek Mountain Bike
  '13103e19-450e-4084-ac0a-36c1620f3971',  -- Kayak with Paddle
  ARRAY['c5d82e36-ec10-4094-a694-c0e02891e2e6']::uuid[],
  ARRAY['13103e19-450e-4084-ac0a-36c1620f3971']::uuid[],
  'pending',
  true,   -- Requester has accepted (by proposing)
  false   -- Owner (you) needs to accept
);