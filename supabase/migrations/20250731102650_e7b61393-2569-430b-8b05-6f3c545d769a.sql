-- Create function to mark items as unavailable when trade is completed
CREATE OR REPLACE FUNCTION mark_traded_items_unavailable()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically mark items unavailable when trade completes
CREATE TRIGGER trigger_mark_traded_items_unavailable
  AFTER UPDATE ON trade_conversations
  FOR EACH ROW
  EXECUTE FUNCTION mark_traded_items_unavailable();