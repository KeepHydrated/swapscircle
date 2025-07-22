-- Add support for multiple images per item
-- Change image_url to image_urls array to support up to 5 images per item

-- Add new column for multiple images
ALTER TABLE public.items 
ADD COLUMN image_urls text[];

-- Migrate existing single image_url data to the new array column
UPDATE public.items 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL;

-- Create index for better performance when querying images
CREATE INDEX idx_items_image_urls ON public.items USING GIN(image_urls);