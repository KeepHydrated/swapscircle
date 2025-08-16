-- First, let's see the current RLS policies on support_messages
-- Then create proper RLS policies for support_messages

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.support_messages;
DROP POLICY IF EXISTS "Support admin can update messages" ON public.support_messages;

-- Create proper RLS policies for support_messages
CREATE POLICY "Users can view their conversation messages" 
ON public.support_messages 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM support_conversations WHERE id = conversation_id
  ) OR 
  (auth.jwt() ->> 'email'::text) = 'nadiachibri@gmail.com'
);

CREATE POLICY "Users can create their own messages" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'email'::text) = 'nadiachibri@gmail.com'
);

CREATE POLICY "Support admin can update messages" 
ON public.support_messages 
FOR UPDATE 
USING ((auth.jwt() ->> 'email'::text) = 'nadiachibri@gmail.com');