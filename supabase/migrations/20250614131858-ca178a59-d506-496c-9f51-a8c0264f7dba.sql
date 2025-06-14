
-- Create the item-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images', 
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
);

-- Create storage policy to allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own item images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'item-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow public read access to item images
CREATE POLICY "Public can view item images" ON storage.objects
FOR SELECT USING (bucket_id = 'item-images');

-- Create storage policy to allow users to update their own item images
CREATE POLICY "Users can update their own item images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'item-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow users to delete their own item images
CREATE POLICY "Users can delete their own item images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'item-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
