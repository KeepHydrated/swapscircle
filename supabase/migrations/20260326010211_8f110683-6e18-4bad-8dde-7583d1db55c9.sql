
-- Add is_support column to trade_conversations
ALTER TABLE public.trade_conversations ADD COLUMN IF NOT EXISTS is_support boolean DEFAULT false;

-- Make item IDs nullable for support conversations
ALTER TABLE public.trade_conversations ALTER COLUMN requester_item_id DROP NOT NULL;
ALTER TABLE public.trade_conversations ALTER COLUMN owner_item_id DROP NOT NULL;
