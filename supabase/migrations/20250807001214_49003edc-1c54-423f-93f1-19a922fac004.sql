-- Update the status check constraint to include 'removed' status
ALTER TABLE items DROP CONSTRAINT items_status_check;
ALTER TABLE items ADD CONSTRAINT items_status_check CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'removed'::text]));