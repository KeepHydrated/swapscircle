-- Ensure the trigger for updating trade status is properly configured
DROP TRIGGER IF EXISTS update_trade_status_trigger ON trade_conversations;

CREATE TRIGGER update_trade_status_trigger
  BEFORE UPDATE ON trade_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_trade_status();