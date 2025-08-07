-- Drop and recreate the policy with both USING and WITH CHECK clauses
DROP POLICY IF EXISTS "Admin moderation updates" ON public.items;

CREATE POLICY "Admin moderation updates" ON public.items
FOR UPDATE
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
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role 
    AND is_active = true
  )
);