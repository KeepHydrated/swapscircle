
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own profile
CREATE POLICY "Allow users to SELECT their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to INSERT a profile for themselves (only allow one per user)
CREATE POLICY "Allow users to INSERT their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Allow users to UPDATE their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Optionally, allow users to DELETE their own profile
CREATE POLICY "Allow users to DELETE their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);
