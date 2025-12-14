
-- Insert a test trade conversation where the current user is the OWNER (receiver)
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
  '1611ee2b-ab23-493d-9567-82dba0a81991',
  'b5fbf0c4-f064-4be4-99cf-4d32a69b22fc',
  'c5d82e36-ec10-4094-a694-c0e02891e2e6',
  '13103e19-450e-4084-ac0a-36c1620f3971',
  ARRAY['c5d82e36-ec10-4094-a694-c0e02891e2e6']::uuid[],
  ARRAY['13103e19-450e-4084-ac0a-36c1620f3971']::uuid[],
  'pending',
  false,
  false
);
