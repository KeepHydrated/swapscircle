
-- Add address columns to the profiles table
ALTER TABLE public.profiles
  ADD COLUMN street text,
  ADD COLUMN city text,
  ADD COLUMN state text,
  ADD COLUMN zip_code text;

-- (No need to add country, as it is already represented by 'location' if needed)
