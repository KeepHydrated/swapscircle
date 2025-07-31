-- Add my_item_id column to liked_items table to make likes item-pair specific
ALTER TABLE liked_items ADD COLUMN my_item_id UUID;

-- Create index for better performance on the new column
CREATE INDEX idx_liked_items_my_item_id ON liked_items(my_item_id);

-- Clean up existing likes since they don't have my_item_id
DELETE FROM liked_items WHERE user_id = '2f3aeee8-c5a3-4fac-80ad-653355be1e53';