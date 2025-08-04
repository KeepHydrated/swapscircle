-- Add DELETE policy for friend_requests table to allow unfriending
CREATE POLICY "Users can delete their friend requests" 
ON friend_requests 
FOR DELETE 
USING ((auth.uid() = requester_id) OR (auth.uid() = recipient_id));