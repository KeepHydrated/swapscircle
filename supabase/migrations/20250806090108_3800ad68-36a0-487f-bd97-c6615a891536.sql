-- Insert admin role for your email if it doesn't exist
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'admin'::app_role, true
FROM auth.users 
WHERE email = 'nadiahsheriff@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;