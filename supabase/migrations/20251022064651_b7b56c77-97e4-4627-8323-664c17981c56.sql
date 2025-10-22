-- Create items storage bucket for temporary image checks
INSERT INTO storage.buckets (id, name, public)
VALUES ('items', 'items', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to temp folder
CREATE POLICY "Allow authenticated users to upload temp images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'items' 
  AND (storage.foldername(name))[1] = 'temp'
);

-- Allow authenticated users to delete their temp images
CREATE POLICY "Allow authenticated users to delete temp images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'items' 
  AND (storage.foldername(name))[1] = 'temp'
);

-- Allow public read access to items bucket (for image URLs)
CREATE POLICY "Allow public read access to items"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'items');