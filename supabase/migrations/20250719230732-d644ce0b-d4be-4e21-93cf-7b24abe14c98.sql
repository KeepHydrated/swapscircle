-- Update notifications table RLS policies to allow inserting notifications
CREATE POLICY "Users can create notifications for others"
ON public.notifications
FOR INSERT
WITH CHECK (true);