-- First, let's check if the liked_items table exists and create it if needed
CREATE TABLE IF NOT EXISTS public.liked_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS on liked_items
ALTER TABLE public.liked_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for liked_items
DROP POLICY IF EXISTS "Users can manage their own likes" ON public.liked_items;
CREATE POLICY "Users can manage their own likes" ON public.liked_items
  FOR ALL USING (auth.uid() = user_id);

-- Create the mutual_matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mutual_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  user1_item_id UUID NOT NULL,
  user2_item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on mutual_matches  
ALTER TABLE public.mutual_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mutual_matches
DROP POLICY IF EXISTS "Users can view their own matches" ON public.mutual_matches;
CREATE POLICY "Users can view their own matches" ON public.mutual_matches
  FOR SELECT USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

DROP POLICY IF EXISTS "System can create matches" ON public.mutual_matches;
CREATE POLICY "System can create matches" ON public.mutual_matches
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_liked_items_user_id ON public.liked_items(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_items_item_id ON public.liked_items(item_id);
CREATE INDEX IF NOT EXISTS idx_mutual_matches_users ON public.mutual_matches(user1_id, user2_id);