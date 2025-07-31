-- Add my_item_id column to rejections table to make rejections item-pair specific
ALTER TABLE public.rejections 
ADD COLUMN my_item_id UUID;

-- Add a comment to explain the new column
COMMENT ON COLUMN public.rejections.my_item_id IS 'The ID of the user''s own item that they rejected the match for';

-- Create a unique constraint to prevent duplicate rejections for the same item pair
CREATE UNIQUE INDEX idx_rejections_unique_pair 
ON public.rejections(user_id, item_id, my_item_id) 
WHERE my_item_id IS NOT NULL;