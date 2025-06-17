
-- Create a table for confirmed mutual matches
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  user1_item_id UUID NOT NULL,
  user2_item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Add foreign key constraints
  CONSTRAINT fk_user1_item FOREIGN KEY (user1_item_id) REFERENCES public.items(id) ON DELETE CASCADE,
  CONSTRAINT fk_user2_item FOREIGN KEY (user2_item_id) REFERENCES public.items(id) ON DELETE CASCADE,
  
  -- Simple unique constraint to prevent exact duplicates
  CONSTRAINT unique_match UNIQUE (user1_id, user2_id, user1_item_id, user2_item_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Users can view matches where they are either user1 or user2
CREATE POLICY "Users can view their own matches" 
  ON public.matches 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create matches where they are either user1 or user2
CREATE POLICY "Users can create matches they participate in" 
  ON public.matches 
  FOR INSERT 
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create indexes for faster lookups
CREATE INDEX idx_matches_user1 ON public.matches(user1_id);
CREATE INDEX idx_matches_user2 ON public.matches(user2_id);
CREATE INDEX idx_matches_users ON public.matches(user1_id, user2_id);
