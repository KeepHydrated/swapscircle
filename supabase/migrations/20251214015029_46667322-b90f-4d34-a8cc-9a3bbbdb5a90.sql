-- Create a sample trade request where Aneesha D requests to trade their Trek Mountain Bike for NadiaHibrinnnn's Kayak with Paddle
-- NadiaHibrinnnn (b5fbf0c4-f064-4be4-99cf-4d32a69b22fc) is the owner who will see Accept/Reject buttons
-- Aneesha D (1611ee2b-ab23-493d-9567-82dba0a81991) is the requester

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
  '1611ee2b-ab23-493d-9567-82dba0a81991', -- Aneesha D (requester)
  'b5fbf0c4-f064-4be4-99cf-4d32a69b22fc', -- NadiaHibrinnnn (you - the owner)
  'c5d82e36-ec10-4094-a694-c0e02891e2e6', -- Trek Mountain Bike
  '13103e19-450e-4084-ac0a-36c1620f3971', -- Kayak with Paddle
  'pending',
  false,
  false,
  ARRAY['c5d82e36-ec10-4094-a694-c0e02891e2e6']::uuid[]
);