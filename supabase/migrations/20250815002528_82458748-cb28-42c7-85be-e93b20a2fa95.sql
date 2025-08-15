-- Create support_messages table for storing chat messages
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support')),
  conversation_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Create support_conversations table for grouping messages
CREATE TABLE public.support_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for support_messages
CREATE POLICY "Users can view their own messages" 
ON public.support_messages 
FOR SELECT 
USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'nadiachibri@gmail.com');

CREATE POLICY "Users can create their own messages" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'nadiachibri@gmail.com');

CREATE POLICY "Support admin can update messages" 
ON public.support_messages 
FOR UPDATE 
USING (auth.jwt() ->> 'email' = 'nadiachibri@gmail.com');

-- Policies for support_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.support_conversations 
FOR SELECT 
USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'nadiachibri@gmail.com');

CREATE POLICY "Users can create their own conversations" 
ON public.support_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'nadiachibri@gmail.com');

CREATE POLICY "Support admin can update conversations" 
ON public.support_conversations 
FOR UPDATE 
USING (auth.jwt() ->> 'email' = 'nadiachibri@gmail.com');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_support_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_support_messages_updated_at
BEFORE UPDATE ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_support_timestamps();

CREATE TRIGGER update_support_conversations_updated_at
BEFORE UPDATE ON public.support_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_support_timestamps();

-- Create indexes for better performance
CREATE INDEX idx_support_messages_conversation_id ON public.support_messages(conversation_id);
CREATE INDEX idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX idx_support_conversations_user_id ON public.support_conversations(user_id);
CREATE INDEX idx_support_conversations_status ON public.support_conversations(status);