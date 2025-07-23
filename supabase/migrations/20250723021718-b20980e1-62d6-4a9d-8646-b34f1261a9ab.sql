-- Add missing columns to existing tables
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update friend_requests table to have correct column names
ALTER TABLE public.friend_requests 
ADD COLUMN IF NOT EXISTS recipient_id UUID;

-- Update friend_requests to match expected schema
UPDATE public.friend_requests 
SET recipient_id = requested_id 
WHERE recipient_id IS NULL;

-- Create trade_conversations table
CREATE TABLE IF NOT EXISTS public.trade_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  requester_item_id UUID NOT NULL,
  owner_item_id UUID NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on trade_conversations
ALTER TABLE public.trade_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for trade_conversations
CREATE POLICY "Users can view their own trade conversations" 
ON public.trade_conversations 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create trade conversations" 
ON public.trade_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own trade conversations" 
ON public.trade_conversations 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Create messages table for trade conversations
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.trade_conversations tc 
  WHERE tc.id = messages.conversation_id 
  AND (tc.requester_id = auth.uid() OR tc.owner_id = auth.uid())
));

CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.trade_conversations tc 
    WHERE tc.id = messages.conversation_id 
    AND (tc.requester_id = auth.uid() OR tc.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id);