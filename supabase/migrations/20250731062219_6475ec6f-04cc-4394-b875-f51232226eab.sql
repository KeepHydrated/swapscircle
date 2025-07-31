-- Add my_item_id column to rejections table to make rejections item-pair specific
ALTER TABLE public.rejections 
ADD COLUMN my_item_id UUID;

-- Add a comment to explain the new column
COMMENT ON COLUMN public.rejections.my_item_id IS 'The ID of the user''s own item that they rejected the match for';

-- Update existing rejections to have a NULL my_item_id (they'll be treated as global rejections)
-- New rejections will be item-pair specific

-- Create a unique constraint to prevent duplicate rejections for the same item pair
CREATE UNIQUE INDEX CONCURRENTLY idx_rejections_unique_pair 
ON public.rejections(user_id, item_id, my_item_id) 
WHERE my_item_id IS NOT NULL;

-- Keep the old unique constraint for backwards compatibility with global rejections (where my_item_id is NULL)
-- This prevents the same global rejection from being created multiple times