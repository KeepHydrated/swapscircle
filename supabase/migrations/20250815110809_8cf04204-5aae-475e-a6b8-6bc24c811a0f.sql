-- Add foreign key relationship between support_conversations and profiles
ALTER TABLE public.support_conversations 
ADD CONSTRAINT support_conversations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;