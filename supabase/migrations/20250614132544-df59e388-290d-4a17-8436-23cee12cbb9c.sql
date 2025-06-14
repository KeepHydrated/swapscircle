
-- Create a table for liked items
CREATE TABLE public.liked_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Add Row Level Security (RLS) to ensure users can only see their own liked items
ALTER TABLE public.liked_items ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own liked items
CREATE POLICY "Users can view their own liked items" 
  ON public.liked_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own liked items
CREATE POLICY "Users can create their own liked items" 
  ON public.liked_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own liked items
CREATE POLICY "Users can delete their own liked items" 
  ON public.liked_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for better performance
CREATE INDEX idx_liked_items_user_id ON public.liked_items(user_id);
CREATE INDEX idx_liked_items_item_id ON public.liked_items(item_id);
