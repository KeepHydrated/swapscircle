-- Update trade_messages table to support multiple images
ALTER TABLE trade_messages DROP COLUMN IF EXISTS image_url;
ALTER TABLE trade_messages ADD COLUMN image_urls TEXT[] DEFAULT '{}';

-- Update existing messages table as well to support multiple images
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';