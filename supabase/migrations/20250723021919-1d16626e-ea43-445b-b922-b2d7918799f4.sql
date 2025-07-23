-- Create missing storage bucket for item images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true);

-- Create storage policies for item images
CREATE POLICY "Anyone can view item images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'item-images');

CREATE POLICY "Users can upload item images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own item images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own item images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix reviews table - add missing reviewer_id column
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS reviewer_id UUID,
ADD COLUMN IF NOT EXISTS reviewee_id UUID;

-- Create foreign key constraints for trade_conversations
ALTER TABLE public.trade_conversations 
ADD CONSTRAINT trade_conversations_requester_item_id_fkey 
FOREIGN KEY (requester_item_id) REFERENCES public.items(id),
ADD CONSTRAINT trade_conversations_owner_item_id_fkey 
FOREIGN KEY (owner_item_id) REFERENCES public.items(id);