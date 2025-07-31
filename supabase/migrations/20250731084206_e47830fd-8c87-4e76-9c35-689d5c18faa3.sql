-- Add RLS policy to allow reading other users' liked items for mutual matching
-- This is needed for the mutual matching service to work properly

CREATE POLICY "Allow reading liked items for mutual matching" 
ON public.liked_items 
FOR SELECT 
USING (true);

-- Note: This allows any authenticated user to see what items others have liked
-- which is necessary for the mutual matching functionality to work