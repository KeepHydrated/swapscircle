-- Populate looking_for_price_ranges from existing price_range_min and price_range_max values
-- This will create a text array of price ranges based on the existing min/max values
UPDATE public.items
SET looking_for_price_ranges = ARRAY[price_range_min || ' - ' || price_range_max]
WHERE price_range_min IS NOT NULL AND price_range_max IS NOT NULL
AND looking_for_price_ranges IS NULL;