-- Update the current user's profile to have the proper name
UPDATE profiles 
SET name = 'John Smith', updated_at = now() 
WHERE id = '71ea017a-8c81-4437-9a39-06811cb01a02' AND name IS NULL;