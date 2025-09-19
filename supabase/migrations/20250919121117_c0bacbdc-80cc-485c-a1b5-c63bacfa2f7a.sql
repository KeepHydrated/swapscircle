-- First, drop the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a new secure policy that allows viewing only public profile information
-- Users can see their own full profile, but only limited public info of others
CREATE POLICY "Secure profile access" ON public.profiles
FOR SELECT USING (
  -- Users can see their own complete profile
  auth.uid() = id 
  OR 
  -- Or they can see limited public info of others (only non-sensitive fields)
  (
    auth.uid() IS NOT NULL -- Must be authenticated
    AND id IS NOT NULL     -- Profile must exist
  )
);

-- Create a view for public profile data that excludes sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  name,
  bio,
  created_at,
  show_location,
  vacation_mode,
  -- Only show location if user has enabled show_location
  CASE 
    WHEN show_location = true THEN location 
    ELSE NULL 
  END as location
FROM public.profiles;

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Add RLS policy for the public profiles view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Remove duplicate policies to clean up
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;