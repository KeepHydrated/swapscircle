-- Drop the view and recreate it without security definer properties
DROP VIEW IF EXISTS public.public_profiles;

-- Create a properly secured view for public profile data
CREATE VIEW public.public_profiles AS
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
FROM public.profiles
WHERE 
  -- Users can only see profiles through this view if they're authenticated
  -- The base table RLS will still apply
  auth.uid() IS NOT NULL;

-- Grant appropriate access
GRANT SELECT ON public.public_profiles TO authenticated;