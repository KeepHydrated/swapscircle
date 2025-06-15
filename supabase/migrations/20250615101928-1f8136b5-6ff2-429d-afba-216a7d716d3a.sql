
-- Enable RLS on both tables first
ALTER TABLE public.trade_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_messages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for trade_conversations (only if they don't exist)
DO $$ 
BEGIN
    -- Check and create policies for trade_conversations
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trade_conversations' 
        AND policyname = 'Users can view their own trade conversations'
    ) THEN
        CREATE POLICY "Users can view their own trade conversations" 
          ON public.trade_conversations 
          FOR SELECT 
          USING (auth.uid() = requester_id OR auth.uid() = owner_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trade_conversations' 
        AND policyname = 'Users can create trade conversations'
    ) THEN
        CREATE POLICY "Users can create trade conversations" 
          ON public.trade_conversations 
          FOR INSERT 
          WITH CHECK (auth.uid() = requester_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trade_conversations' 
        AND policyname = 'Users can update their own trade conversations'
    ) THEN
        CREATE POLICY "Users can update their own trade conversations" 
          ON public.trade_conversations 
          FOR UPDATE 
          USING (auth.uid() = requester_id OR auth.uid() = owner_id);
    END IF;

    -- Check and create policies for trade_messages
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trade_messages' 
        AND policyname = 'Users can view messages in their trade conversations'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trade_messages' 
        AND policyname = 'Users can send messages in their trade conversations'
    ) THEN
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
    END IF;
END $$;
