-- Create support_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS on support_messages
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for support_messages
CREATE POLICY "Users can view their own messages" ON support_messages
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    (auth.jwt() ->> 'email') = 'nadiachibri@gmail.com'
  );

CREATE POLICY "Users can create their own messages" ON support_messages
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() OR 
    (auth.jwt() ->> 'email') = 'nadiachibri@gmail.com'
  );

CREATE POLICY "Support admin can create messages" ON support_messages
  FOR INSERT 
  WITH CHECK ((auth.jwt() ->> 'email') = 'nadiachibri@gmail.com');

CREATE POLICY "Support admin can update messages" ON support_messages
  FOR UPDATE 
  USING ((auth.jwt() ->> 'email') = 'nadiachibri@gmail.com');

-- Set up replica identity for real-time
ALTER TABLE support_messages REPLICA IDENTITY FULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_support_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_messages_updated_at
  BEFORE UPDATE ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_support_messages_updated_at();