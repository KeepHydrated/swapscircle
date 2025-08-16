-- Drop existing problematic policies and create new ones
DROP POLICY IF EXISTS "Users can view their own messages" ON support_messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON support_messages;
DROP POLICY IF EXISTS "Support admin can create messages" ON support_messages;
DROP POLICY IF EXISTS "Support admin can update messages" ON support_messages;

-- Create more permissive policies that work with real-time
CREATE POLICY "Anyone in conversation can view messages" ON support_messages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM support_conversations sc 
      WHERE sc.id = conversation_id 
      AND (sc.user_id = auth.uid() OR (auth.jwt() ->> 'email') = 'nadiachibri@gmail.com')
    )
  );

CREATE POLICY "Anyone in conversation can create messages" ON support_messages
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_conversations sc 
      WHERE sc.id = conversation_id 
      AND (sc.user_id = auth.uid() OR (auth.jwt() ->> 'email') = 'nadiachibri@gmail.com')
    )
  );

CREATE POLICY "Support admin can update any message" ON support_messages
  FOR UPDATE 
  USING ((auth.jwt() ->> 'email') = 'nadiachibri@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'nadiachibri@gmail.com');