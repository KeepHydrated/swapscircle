-- Add missing columns to trade_conversations table
ALTER TABLE public.trade_conversations 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;