-- Clean up the test drafts that were just created
DELETE FROM items 
WHERE status = 'draft' 
AND name = 'h' 
AND description = 'b';