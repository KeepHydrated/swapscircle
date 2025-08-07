-- Let's test the auth context and admin check with a more detailed query
SELECT 
  auth.uid() as current_user_id,
  (SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true) as admin_role,
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role 
    AND is_active = true
  ) as has_admin_role;

-- Let's also create a more permissive temporary policy to test
DROP POLICY IF EXISTS "Admin moderation updates" ON public.items;

-- Create a broader admin policy that should definitely work
CREATE POLICY "Admin bypass for item updates" ON public.items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role 
    AND is_active = true
  )
)
WITH CHECK (
  -- Allow admin updates OR user owns the item
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role 
    AND is_active = true
  ) OR auth.uid() = user_id
);