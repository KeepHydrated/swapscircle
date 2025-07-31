-- Update the function to fix security warning by setting search_path
CREATE OR REPLACE FUNCTION mark_traded_items_unavailable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Mark both items as unavailable
    UPDATE items 
    SET is_available = false, 
        updated_at = now() 
    WHERE id = NEW.requester_item_id OR id = NEW.owner_item_id;
    
    RAISE NOTICE 'Marked items % and % as unavailable due to completed trade %', 
      NEW.requester_item_id, NEW.owner_item_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;