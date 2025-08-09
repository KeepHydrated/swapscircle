-- Create user_bans table to track user bans and suspensions
CREATE TABLE IF NOT EXISTS public.user_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
  ban_duration_days INTEGER, -- NULL for permanent bans
  reason TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent bans
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all bans" 
ON public.user_bans 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND (role = 'admin' OR role = 'moderator')
  AND is_active = true
));

CREATE POLICY "Admins can create bans" 
ON public.user_bans 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND (role = 'admin' OR role = 'moderator')
  AND is_active = true
));

CREATE POLICY "Admins can update bans" 
ON public.user_bans 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND (role = 'admin' OR role = 'moderator')
  AND is_active = true
));

-- Function to get user's ban history count
CREATE OR REPLACE FUNCTION public.get_user_ban_count(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ban_count INTEGER;
BEGIN
  -- Count previous bans (both expired and active)
  SELECT COUNT(*)
  INTO ban_count
  FROM user_bans
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(ban_count, 0);
END;
$$;

-- Function to ban a user with progressive penalties
CREATE OR REPLACE FUNCTION public.ban_user_progressive(
  target_user_id UUID,
  admin_user_id UUID,
  ban_reason TEXT
)
RETURNS TABLE (
  ban_id UUID,
  ban_duration_days INTEGER,
  ban_type TEXT,
  previous_ban_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prev_ban_count INTEGER;
  new_ban_duration INTEGER;
  new_ban_type TEXT;
  expires_at_date TIMESTAMP WITH TIME ZONE;
  new_ban_id UUID;
BEGIN
  -- Check if admin has permission
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND (role = 'admin' OR role = 'moderator')
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Only administrators and moderators can ban users';
  END IF;

  -- Get previous ban count
  prev_ban_count := get_user_ban_count(target_user_id);
  
  -- Determine ban duration based on history
  IF prev_ban_count = 0 THEN
    -- First offense: 15 days
    new_ban_duration := 15;
    new_ban_type := 'temporary';
    expires_at_date := now() + interval '15 days';
  ELSIF prev_ban_count = 1 THEN
    -- Second offense: 30 days  
    new_ban_duration := 30;
    new_ban_type := 'temporary';
    expires_at_date := now() + interval '30 days';
  ELSE
    -- Third+ offense: permanent ban
    new_ban_duration := NULL;
    new_ban_type := 'permanent';
    expires_at_date := NULL;
  END IF;
  
  -- Deactivate any existing active bans for this user
  UPDATE user_bans 
  SET is_active = false, updated_at = now()
  WHERE user_id = target_user_id AND is_active = true;
  
  -- Create new ban record
  INSERT INTO user_bans (
    user_id,
    banned_by,
    ban_type,
    ban_duration_days,
    reason,
    expires_at
  ) VALUES (
    target_user_id,
    admin_user_id,
    new_ban_type,
    new_ban_duration,
    ban_reason,
    expires_at_date
  ) RETURNING id INTO new_ban_id;
  
  -- Return ban details
  RETURN QUERY SELECT 
    new_ban_id,
    new_ban_duration,
    new_ban_type,
    prev_ban_count;
END;
$$;

-- Function to check if user is currently banned
CREATE OR REPLACE FUNCTION public.is_user_banned(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_bans
    WHERE user_id = check_user_id
    AND is_active = true
    AND (ban_type = 'permanent' OR (expires_at IS NOT NULL AND expires_at > now()))
  );
END;
$$;

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_user_bans_updated_at
BEFORE UPDATE ON public.user_bans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();