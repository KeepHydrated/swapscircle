-- Add a column to track if an item has been edited after duplication
ALTER TABLE public.items 
ADD COLUMN has_been_edited boolean NOT NULL DEFAULT true;

-- Set existing items to true (assume they can be published)
UPDATE public.items 
SET has_been_edited = true;

-- Add a comment to explain the purpose
COMMENT ON COLUMN public.items.has_been_edited IS 'Tracks if a duplicated item has been edited and can be published';