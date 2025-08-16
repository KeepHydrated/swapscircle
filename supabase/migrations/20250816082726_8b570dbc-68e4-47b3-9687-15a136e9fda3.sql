-- Enable real-time for support_messages table
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE support_messages;

-- Drop existing policies and create simpler ones for real-time
DROP POLICY IF EXISTS "Anyone in conversation can view messages" ON support_messages;
DROP POLICY IF EXISTS "Anyone in conversation can create messages" ON support_messages;
DROP POLICY IF EXISTS "Support admin can update any message" ON support_messages;

-- Create simpler policies that work better with real-time
CREATE POLICY "Users can view messages" ON support_messages
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create messages" ON support_messages
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Support admin can update messages" ON support_messages
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);