
-- Create trade_conversations table to store trade requests between users
CREATE TABLE public.trade_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid REFERENCES auth.users NOT NULL,
  owner_id uuid REFERENCES auth.users NOT NULL,
  requester_item_id uuid REFERENCES public.items(id) NOT NULL,
  owner_item_id uuid REFERENCES public.items(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create trade_messages table to store messages within trade conversations
CREATE TABLE public.trade_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_conversation_id uuid REFERENCES public.trade_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on trade_conversations
ALTER TABLE public.trade_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for trade_conversations - users can see trades they're involved in
CREATE POLICY "Users can view their own trade conversations" 
  ON public.trade_conversations 
  FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Create policy for trade_conversations - users can create trade requests
CREATE POLICY "Users can create trade conversations" 
  ON public.trade_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

-- Create policy for trade_conversations - users can update their own trades
CREATE POLICY "Users can update their own trade conversations" 
  ON public.trade_conversations 
  FOR UPDATE 
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Enable RLS on trade_messages
ALTER TABLE public.trade_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for trade_messages - users can view messages in their trade conversations
CREATE POLICY "Users can view messages in their trade conversations" 
  ON public.trade_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.trade_conversations tc 
      WHERE tc.id = trade_conversation_id 
      AND (tc.requester_id = auth.uid() OR tc.owner_id = auth.uid())
    )
  );

-- Create policy for trade_messages - users can send messages in their trade conversations
CREATE POLICY "Users can send messages in their trade conversations" 
  ON public.trade_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.trade_conversations tc 
      WHERE tc.id = trade_conversation_id 
      AND (tc.requester_id = auth.uid() OR tc.owner_id = auth.uid())
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_trade_conversations_requester ON public.trade_conversations(requester_id);
CREATE INDEX idx_trade_conversations_owner ON public.trade_conversations(owner_id);
CREATE INDEX idx_trade_conversations_status ON public.trade_conversations(status);
CREATE INDEX idx_trade_messages_conversation ON public.trade_messages(trade_conversation_id);
CREATE INDEX idx_trade_messages_created_at ON public.trade_messages(created_at);
