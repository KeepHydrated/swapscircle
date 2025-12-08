-- Add column to support multiple requester items in a trade
ALTER TABLE trade_conversations 
ADD COLUMN requester_item_ids uuid[] DEFAULT NULL;

-- Comment explaining the column
COMMENT ON COLUMN trade_conversations.requester_item_ids IS 'Array of item IDs the requester is offering for trade. When populated, takes precedence over requester_item_id.';