-- Fix critical security vulnerability in submissions table
-- Remove the dangerous policy that allows all authenticated users to view all submissions
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.submissions;

-- Remove overly broad update policy
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.submissions;

-- Create secure RLS policies for submissions access
-- Only allow users to view their own submissions OR admins/moderators to view all
CREATE POLICY "Users can view own submissions or admins can view all" 
ON public.submissions 
FOR SELECT 
TO authenticated
USING (
  (created_by = auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role = 'moderator')
    AND is_active = true
  ))
);

-- Create secure update policy - only owners or admins can update
CREATE POLICY "Users can update own submissions or admins can update all" 
ON public.submissions 
FOR UPDATE 
TO authenticated
USING (
  (created_by = auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role = 'moderator')
    AND is_active = true
  ))
)
WITH CHECK (
  (created_by = auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role = 'moderator')
    AND is_active = true
  ))
);

-- Clean up duplicate/redundant policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update their own pending submissions" ON public.submissions;