-- Allow users to view other users' profiles for messaging and trading
CREATE POLICY "Users can view all profiles for trading" 
ON public.profiles 
FOR SELECT 
USING (true);