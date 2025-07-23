-- First, drop policies that depend on requested_id
DROP POLICY IF EXISTS "Users can view their own friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Users can update friend requests" ON public.friend_requests;

-- Drop the requested_id column
ALTER TABLE public.friend_requests 
DROP COLUMN IF EXISTS requested_id;

-- Recreate policies using recipient_id instead
CREATE POLICY "Users can view their own friend requests" 
ON public.friend_requests 
FOR SELECT 
USING ((auth.uid() = requester_id) OR (auth.uid() = recipient_id));

CREATE POLICY "Users can update friend requests" 
ON public.friend_requests 
FOR UPDATE 
USING ((auth.uid() = requester_id) OR (auth.uid() = recipient_id));

-- Add missing columns to trade_conversations table
ALTER TABLE public.trade_conversations 
ADD COLUMN IF NOT EXISTS requester_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS owner_accepted boolean DEFAULT false;

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text;

-- Add trade_conversation_id to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS trade_conversation_id uuid;

-- Create matches table as an alias/view to mutual_matches for compatibility
CREATE OR REPLACE VIEW matches AS 
SELECT 
  id,
  user1_id,
  user2_id,
  user1_item_id,
  user2_item_id,
  created_at
FROM mutual_matches;

-- Update profiles table trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();