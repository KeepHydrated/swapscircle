-- Create support_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for support_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.support_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations 
    WHERE support_conversations.id = support_messages.conversation_id 
    AND (support_conversations.user_id = auth.uid() OR (auth.jwt() ->> 'email'::text) = 'nadiachibri@gmail.com'::text)
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.support_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.support_conversations 
    WHERE support_conversations.id = support_messages.conversation_id 
    AND (support_conversations.user_id = auth.uid() OR (auth.jwt() ->> 'email'::text) = 'nadiachibri@gmail.com'::text)
  )
);

CREATE POLICY "Support admin can create messages"
ON public.support_messages
FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'email'::text) = 'nadiachibri@gmail.com'::text
);

CREATE POLICY "Users can update their own messages"
ON public.support_messages
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Support admin can update messages"
ON public.support_messages
FOR UPDATE
USING ((auth.jwt() ->> 'email'::text) = 'nadiachibri@gmail.com'::text);

-- Add the table to realtime publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_support_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_messages_updated_at();