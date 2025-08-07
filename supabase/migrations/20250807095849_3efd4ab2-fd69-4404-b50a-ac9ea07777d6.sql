-- Update the SELECT policy on blocked_users to allow users to see both:
-- 1. Users they have blocked (blocker_id = current_user)  
-- 2. Users who have blocked them (blocked_id = current_user)

DROP POLICY IF EXISTS "Users can view their own blocks" ON blocked_users;

CREATE POLICY "Users can view blocking relationships involving them" 
ON blocked_users 
FOR SELECT 
USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);