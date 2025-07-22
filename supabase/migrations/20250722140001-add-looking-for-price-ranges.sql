-- Add looking_for_price_ranges column to items table
ALTER TABLE public.items ADD COLUMN looking_for_price_ranges text[];