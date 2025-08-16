-- Remove the redundant is_read column since we're using status field
ALTER TABLE notifications DROP COLUMN IF EXISTS is_read;