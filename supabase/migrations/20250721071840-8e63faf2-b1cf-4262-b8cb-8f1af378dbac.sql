-- Add acceptance tracking to trade conversations
ALTER TABLE public.trade_conversations 
ADD COLUMN requester_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN owner_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_conversation_id UUID NOT NULL REFERENCES trade_conversations(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trade_conversation_id, reviewer_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Users can create reviews for their completed trades" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = reviewer_id 
  AND EXISTS (
    SELECT 1 FROM trade_conversations tc 
    WHERE tc.id = trade_conversation_id 
    AND tc.status = 'completed'
    AND (tc.requester_id = auth.uid() OR tc.owner_id = auth.uid())
    AND tc.completed_at IS NOT NULL 
    AND tc.completed_at > now() - interval '30 days'
  )
);

CREATE POLICY "Users can view reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

-- Update trade status logic
CREATE OR REPLACE FUNCTION update_trade_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If both parties accepted, mark as completed
  IF NEW.requester_accepted = TRUE AND NEW.owner_accepted = TRUE AND OLD.status = 'pending' THEN
    NEW.status = 'completed';
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
CREATE TRIGGER update_trade_status_trigger
  BEFORE UPDATE ON public.trade_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_trade_status();