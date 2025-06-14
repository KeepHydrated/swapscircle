
-- Add a username column to the profiles table
ALTER TABLE public.profiles
ADD COLUMN username TEXT;

-- Optionally, add an index to speed up lookup by username in the future
CREATE INDEX profiles_username_idx ON public.profiles(username);

