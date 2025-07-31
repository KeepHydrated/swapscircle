-- Drop the existing constraint that prevents trade reviews
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS review_target;

-- Add a new constraint that allows trade reviews (trade_conversation_id), market reviews (market_id), or vendor reviews (vendor_id)
ALTER TABLE reviews ADD CONSTRAINT review_target_updated 
CHECK (
  (trade_conversation_id IS NOT NULL AND market_id IS NULL AND vendor_id IS NULL) OR
  (trade_conversation_id IS NULL AND market_id IS NOT NULL AND vendor_id IS NULL) OR  
  (trade_conversation_id IS NULL AND market_id IS NULL AND vendor_id IS NOT NULL)
);