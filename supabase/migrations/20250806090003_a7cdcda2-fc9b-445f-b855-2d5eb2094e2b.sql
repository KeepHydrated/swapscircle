-- Add admin role for NadiaHibri
-- First, let's see if the user_roles table and app_role enum exist, if not create them

-- Create the app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table
CREATE POLICY IF NOT EXISTS "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all roles" ON public.user_roles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

CREATE POLICY IF NOT EXISTS "Admins can manage all roles" ON public.user_roles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

-- Insert admin role for NadiaHibri (using email since that's what we can reliably identify)
-- This will only insert if the user exists and doesn't already have admin role
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'admin'::app_role, true
FROM auth.users 
WHERE email = 'nadiahsheriff@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;