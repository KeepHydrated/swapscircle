-- Create rejections table to track when users reject items
CREATE TABLE public.rejections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.rejections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own rejections" 
ON public.rejections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own rejections" 
ON public.rejections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rejections" 
ON public.rejections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_rejections_user_item ON public.rejections(user_id, item_id);
CREATE INDEX idx_rejections_item_id ON public.rejections(item_id);