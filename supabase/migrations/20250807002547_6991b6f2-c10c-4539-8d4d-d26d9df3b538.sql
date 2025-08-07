-- Check all current policies on items table first
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'items';

-- Drop the problematic admin policy and recreate with a different approach
DROP POLICY IF EXISTS "Admins can update any item for moderation" ON public.items;

-- Create a simpler, more direct admin policy
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
);