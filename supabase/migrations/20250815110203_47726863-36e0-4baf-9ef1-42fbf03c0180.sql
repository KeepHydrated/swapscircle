-- Create support_conversations table
CREATE TABLE public.support_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support_messages table  
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_conversations
CREATE POLICY "Users can view their own conversations"
ON public.support_conversations FOR SELECT
USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') = 'nadiachibri@gmail.com');

CREATE POLICY "Users can create their own conversations"
ON public.support_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id OR (auth.jwt() ->> 'email') = 'nadiachibri@gmail.com');

CREATE POLICY "Support admin can update conversations"
ON public.support_conversations FOR UPDATE
USING ((auth.jwt() ->> 'email') = 'nadiachibri@gmail.com');

-- RLS Policies for support_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.support_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations sc
    WHERE sc.id = conversation_id 
    AND (sc.user_id = auth.uid() OR (auth.jwt() ->> 'email') = 'nadiachibri@gmail.com')
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.support_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_conversations sc
    WHERE sc.id = conversation_id 
    AND (sc.user_id = auth.uid() OR (auth.jwt() ->> 'email') = 'nadiachibri@gmail.com')
  )
);

CREATE POLICY "Support admin can update messages"
ON public.support_messages FOR UPDATE
USING ((auth.jwt() ->> 'email') = 'nadiachibri@gmail.com');

-- Create indexes for better performance
CREATE INDEX idx_support_conversations_user_id ON public.support_conversations(user_id);
CREATE INDEX idx_support_conversations_last_message_at ON public.support_conversations(last_message_at DESC);
CREATE INDEX idx_support_messages_conversation_id ON public.support_messages(conversation_id);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at DESC);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_support_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_support_conversations_updated_at
  BEFORE UPDATE ON public.support_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_support_timestamps();

CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_support_timestamps();

-- Enable realtime for tables
ALTER TABLE public.support_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.support_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;