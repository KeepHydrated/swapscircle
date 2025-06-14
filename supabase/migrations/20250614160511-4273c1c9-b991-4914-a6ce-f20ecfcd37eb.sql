
-- Add bio and location columns to the profiles table in public schema
ALTER TABLE public.profiles
ADD COLUMN bio TEXT;

ALTER TABLE public.profiles
ADD COLUMN location TEXT;
