-- Ensure the trigger is attached to the trade_conversations table
DROP TRIGGER IF EXISTS trigger_mark_items_unavailable ON trade_conversations;

CREATE TRIGGER trigger_mark_items_unavailable
  AFTER UPDATE ON trade_conversations
  FOR EACH ROW
  EXECUTE FUNCTION mark_items_unavailable_on_trade_completion();