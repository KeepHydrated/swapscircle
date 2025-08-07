-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Admins can update items for moderation" ON public.items;

-- Create a security definer function to check if user is admin (to avoid any potential RLS recursion)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$;

-- Create a more specific admin policy for item updates
CREATE POLICY "Admins can update any item for moderation" ON public.items
FOR UPDATE
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());