-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

-- Create storage policies for item images
CREATE POLICY "Allow authenticated users to upload item images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'item-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow public read access to item images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'item-images');

CREATE POLICY "Allow users to update their own item images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own item images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);