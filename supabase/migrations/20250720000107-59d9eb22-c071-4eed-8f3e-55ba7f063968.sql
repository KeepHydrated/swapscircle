-- Add DELETE policy for friend_requests table
CREATE POLICY "Users can delete their own friend requests" 
ON friend_requests 
FOR DELETE 
USING ((auth.uid() = requester_id) OR (auth.uid() = recipient_id));