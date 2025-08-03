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

-- Add image_url column to trade_messages table if it doesn't exist
ALTER TABLE trade_messages ADD COLUMN IF NOT EXISTS image_url TEXT;