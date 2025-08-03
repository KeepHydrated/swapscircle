-- Add status column to items table for draft/published functionality
ALTER TABLE items ADD COLUMN status TEXT NOT NULL DEFAULT 'published';

-- Add a check constraint to ensure only valid status values
ALTER TABLE items ADD CONSTRAINT items_status_check CHECK (status IN ('draft', 'published'));

-- Create an index for better performance when filtering by status
CREATE INDEX idx_items_status ON items(status);

-- Update RLS policies to ensure draft items are only visible to their owners
DROP POLICY IF EXISTS "Items are viewable by everyone" ON items;

-- Create new RLS policy for viewing items
CREATE POLICY "Published items are viewable by everyone" ON items
  FOR SELECT
  USING (
    status = 'published' 
    OR (status = 'draft' AND auth.uid() = user_id)
  );

-- Create policy for viewing all items (for owners)
CREATE POLICY "Users can view all their own items" ON items
  FOR SELECT
  USING (auth.uid() = user_id);