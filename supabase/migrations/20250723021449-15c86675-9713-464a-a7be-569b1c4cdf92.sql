-- Create missing tables for the trading/marketplace app

-- Create profiles table with the expected columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

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

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, first_name, last_name, name, email)
  VALUES (
    new.id,
    TRIM(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    CONCAT(COALESCE(new.raw_user_meta_data->>'first_name', ''), ' ', COALESCE(new.raw_user_meta_data->>'last_name', '')),
    new.email
  );
  RETURN new;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();