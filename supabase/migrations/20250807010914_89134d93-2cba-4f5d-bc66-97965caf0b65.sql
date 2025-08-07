-- Create blocked_users table to track user blocking relationships
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique blocking relationships
  UNIQUE(blocker_id, blocked_id),
  
  -- Prevent self-blocking
  CHECK (blocker_id != blocked_id)
);

-- Enable Row Level Security
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users table
CREATE POLICY "Users can view their own blocks" 
ON public.blocked_users 
FOR SELECT 
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks" 
ON public.blocked_users 
FOR INSERT 
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" 
ON public.blocked_users 
FOR DELETE 
USING (auth.uid() = blocker_id);

-- Create indexes for performance
CREATE INDEX idx_blocked_users_blocker_id ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked_id ON public.blocked_users(blocked_id);

-- Create a function to check if a user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_user_id uuid, blocked_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM blocked_users 
    WHERE blocker_id = blocker_user_id 
    AND blocked_id = blocked_user_id
  );
$$;