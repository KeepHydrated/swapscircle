-- Clean up duplicate drafts created during testing
-- Keep only the most recent draft per user for each name
WITH ranked_drafts AS (
  SELECT id, name, user_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id, name ORDER BY created_at DESC) as rn
  FROM items
  WHERE status = 'draft'
)
DELETE FROM items 
WHERE id IN (
  SELECT id FROM ranked_drafts WHERE rn > 1
);