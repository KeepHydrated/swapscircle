-- Update existing profiles table to add missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add missing indexes if needed
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  category TEXT,
  condition TEXT,
  tags TEXT[],
  looking_for_categories TEXT[],
  looking_for_conditions TEXT[],
  looking_for_description TEXT,
  price_range_min DECIMAL,
  price_range_max DECIMAL,
  is_available BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on items
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policies for items
CREATE POLICY "Items are viewable by everyone" 
ON public.items 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own items" 
ON public.items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" 
ON public.items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" 
ON public.items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create liked_items table
CREATE TABLE IF NOT EXISTS public.liked_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS on liked_items
ALTER TABLE public.liked_items ENABLE ROW LEVEL SECURITY;

-- Create policies for liked_items
CREATE POLICY "Users can view their own liked items" 
ON public.liked_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can like items" 
ON public.liked_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike items" 
ON public.liked_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create mutual_matches table
CREATE TABLE IF NOT EXISTS public.mutual_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  user1_item_id UUID NOT NULL,
  user2_item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user1_id, user2_id, user1_item_id, user2_item_id)
);

-- Enable RLS on mutual_matches
ALTER TABLE public.mutual_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for mutual_matches
CREATE POLICY "Users can view their own matches" 
ON public.mutual_matches 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" 
ON public.mutual_matches 
FOR INSERT 
WITH CHECK (true);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  requested_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, requested_id)
);

-- Enable RLS on friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for friend_requests
CREATE POLICY "Users can view their own friend requests" 
ON public.friend_requests 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = requested_id);

CREATE POLICY "Users can create friend requests" 
ON public.friend_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend requests" 
ON public.friend_requests 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = requested_id);

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  requester_item_id UUID NOT NULL,
  owner_item_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  requester_accepted BOOLEAN DEFAULT false,
  owner_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on trades
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policies for trades
CREATE POLICY "Users can view their own trades" 
ON public.trades 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create trades" 
ON public.trades 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own trades" 
ON public.trades 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = owner_id);