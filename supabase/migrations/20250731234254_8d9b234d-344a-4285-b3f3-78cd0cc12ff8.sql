-- Drop the old unique constraint that only considers user_id and item_id
ALTER TABLE rejections DROP CONSTRAINT IF EXISTS rejections_user_id_item_id_key;

-- Add a new unique constraint that includes my_item_id to allow item-pair specific rejections
ALTER TABLE rejections ADD CONSTRAINT rejections_user_id_item_id_my_item_id_key 
UNIQUE (user_id, item_id, my_item_id);