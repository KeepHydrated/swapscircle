-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own liked items" ON liked_items;

-- Create a new policy that allows viewing all liked items for mutual matching
CREATE POLICY "Users can view liked items for mutual matching" 
ON liked_items 
FOR SELECT 
USING (true);