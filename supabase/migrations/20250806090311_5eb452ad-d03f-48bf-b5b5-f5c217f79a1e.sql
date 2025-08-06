-- Add admin role for the correct email address
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'admin'::app_role, true
FROM auth.users 
WHERE email = 'nadiachibri@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;