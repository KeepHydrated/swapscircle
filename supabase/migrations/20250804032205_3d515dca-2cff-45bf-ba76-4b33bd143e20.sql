-- Add looking_for_price_ranges column to items table
ALTER TABLE public.items 
ADD COLUMN looking_for_price_ranges TEXT[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN public.items.looking_for_price_ranges IS 'Array of price range strings that the user is looking for in trades';