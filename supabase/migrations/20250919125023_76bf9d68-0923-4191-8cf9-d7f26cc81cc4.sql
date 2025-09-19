-- Fix analytics access by creating admin-specific policy for analytics queries
-- Allow admins and moderators to view all profiles for analytics purposes
CREATE POLICY "Admins can view all profiles for analytics" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role = 'moderator')
    AND is_active = true
  )
);