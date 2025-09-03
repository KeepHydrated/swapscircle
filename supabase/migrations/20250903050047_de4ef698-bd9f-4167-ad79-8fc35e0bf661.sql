-- Allow users to create their own notifications and notifications for others
-- This is needed for features like friend requests, trades, messages, etc.

-- Drop the existing restrictive INSERT policy
DROP POLICY "Admins and moderators can create notifications" ON public.notifications;

-- Create a new policy that allows authenticated users to create notifications
CREATE POLICY "Users can create notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Also add an UPDATE policy for users to mark their own notifications as read
CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);