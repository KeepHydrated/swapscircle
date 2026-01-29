-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    user_name text;
BEGIN
    -- Extract name from metadata, fall back to email prefix if no name
    user_name := COALESCE(
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'first_name',
        split_part(new.email, '@', 1)
    );
    
    -- Create profile with email synced from auth
    INSERT INTO public.profiles (id, username, name, email, first_name, last_name, country, created_at, updated_at)
    VALUES (
        new.id,
        user_name,
        new.raw_user_meta_data->>'name',
        new.email,  -- Sync email from auth
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'country',
        now(),
        now()
    );
    
    RETURN new;
END;
$function$;

-- Backfill existing users' emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;