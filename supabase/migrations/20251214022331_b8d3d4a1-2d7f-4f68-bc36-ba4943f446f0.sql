-- Add owner_item_ids array column to trade_conversations for multi-item trades
ALTER TABLE public.trade_conversations 
ADD COLUMN IF NOT EXISTS owner_item_ids uuid[] DEFAULT '{}'::uuid[];