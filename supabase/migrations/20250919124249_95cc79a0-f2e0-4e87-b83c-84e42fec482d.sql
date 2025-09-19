-- Fix critical security vulnerability in profiles table
-- Remove the dangerous policy that allows authenticated users to view all profiles
DROP POLICY IF EXISTS "Secure profile access" ON public.profiles;

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a proper secure policy for profile access
-- Users can only view their own full profile data
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Ensure users can only insert their own profile
-- (Update the existing policy to be more explicit)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure users can only update their own profile
-- (The existing policy looks correct but let's make sure it's properly defined)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Remove any duplicate "Users can view their own profile" policy since we created a new one
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;