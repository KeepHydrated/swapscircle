
-- Add preference columns to the items table to store "What You're Looking For" data
ALTER TABLE public.items 
ADD COLUMN looking_for_categories text[],
ADD COLUMN looking_for_conditions text[],
ADD COLUMN looking_for_description text,
ADD COLUMN price_range_min numeric,
ADD COLUMN price_range_max numeric;
