-- Update existing profiles to have both name and username fields set
UPDATE profiles 
SET name = username 
WHERE name IS NULL AND username IS NOT NULL;