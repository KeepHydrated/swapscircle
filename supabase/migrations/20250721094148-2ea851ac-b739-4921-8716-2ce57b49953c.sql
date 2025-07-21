-- Add is_available column to items table to track if item is still available for trading
ALTER TABLE public.items 
ADD COLUMN is_available boolean NOT NULL DEFAULT true;

-- Create index for better performance when filtering available items
CREATE INDEX idx_items_is_available ON public.items(is_available);

-- Create or replace function to mark items as unavailable when trade is completed
CREATE OR REPLACE FUNCTION public.mark_items_unavailable_on_trade_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- If both parties accepted and status is now completed, mark items as unavailable
  IF NEW.requester_accepted = TRUE AND NEW.owner_accepted = TRUE AND NEW.status = 'completed' THEN
    -- Mark both items in the trade as unavailable
    UPDATE public.items 
    SET is_available = false, updated_at = now()
    WHERE id IN (NEW.requester_item_id, NEW.owner_item_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically mark items as unavailable when trade is completed
DROP TRIGGER IF EXISTS mark_items_unavailable_on_trade_completion ON public.trade_conversations;
CREATE TRIGGER mark_items_unavailable_on_trade_completion
  AFTER UPDATE ON public.trade_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_items_unavailable_on_trade_completion();