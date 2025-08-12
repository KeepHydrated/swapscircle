-- Create a secure server-side deletion function to avoid FK/RLS issues when deleting items
-- This function ensures only the item owner (or an active admin/moderator) can delete
-- and deletes dependent rows in the correct order before removing the item

CREATE OR REPLACE FUNCTION public.delete_item_cascade(p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_owner uuid;
  v_is_admin_or_mod boolean := false;
BEGIN
  -- Ensure item exists and get owner
  SELECT user_id INTO v_owner FROM items WHERE id = p_item_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  -- Check if caller is admin or moderator
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin','moderator')
      AND is_active = true
  ) INTO v_is_admin_or_mod;

  -- Authorization: owner or admin/moderator only
  IF auth.uid() IS NULL OR (auth.uid() <> v_owner AND NOT v_is_admin_or_mod) THEN
    RAISE EXCEPTION 'Not authorized to delete this item';
  END IF;

  -- 1) Delete messages linked to trade conversations involving this item
  -- If your schema doesn't have these tables, this will error; but they exist in this project
  DELETE FROM messages
  WHERE conversation_id IN (
    SELECT id FROM trade_conversations 
    WHERE requester_item_id = p_item_id OR owner_item_id = p_item_id
  );

  -- 2) Delete trade conversations referencing this item
  DELETE FROM trade_conversations
  WHERE requester_item_id = p_item_id OR owner_item_id = p_item_id;

  -- 3) Delete trades possibly referencing this item
  DELETE FROM trades
  WHERE requester_item_id = p_item_id OR owner_item_id = p_item_id;

  -- 4) Delete mutual matches involving this item
  DELETE FROM mutual_matches
  WHERE user1_item_id = p_item_id OR user2_item_id = p_item_id;

  -- 5) Delete likes and rejections involving this item
  DELETE FROM liked_items WHERE item_id = p_item_id OR my_item_id = p_item_id;
  DELETE FROM rejections WHERE item_id = p_item_id OR my_item_id = p_item_id;

  -- 6) Finally delete the item
  DELETE FROM items WHERE id = p_item_id;
END;
$$;