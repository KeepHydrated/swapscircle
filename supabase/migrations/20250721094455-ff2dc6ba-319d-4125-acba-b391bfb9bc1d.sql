-- Add is_hidden column to items table to allow users to manually hide items
ALTER TABLE public.items 
ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;

-- Create index for better performance when filtering hidden items
CREATE INDEX idx_items_is_hidden ON public.items(is_hidden);