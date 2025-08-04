-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', true);

-- Create policies for message attachments
CREATE POLICY "Anyone can view message attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can upload message attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own message attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own message attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trade_messages table
CREATE TABLE trade_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES trade_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on trade_messages
ALTER TABLE trade_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for trade_messages
CREATE POLICY "Users can view messages in their conversations" 
ON trade_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM trade_conversations tc 
  WHERE tc.id = conversation_id 
  AND (tc.requester_id = auth.uid() OR tc.owner_id = auth.uid())
));

CREATE POLICY "Users can send messages in their conversations" 
ON trade_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM trade_conversations tc 
    WHERE tc.id = conversation_id 
    AND (tc.requester_id = auth.uid() OR tc.owner_id = auth.uid())
  )
);