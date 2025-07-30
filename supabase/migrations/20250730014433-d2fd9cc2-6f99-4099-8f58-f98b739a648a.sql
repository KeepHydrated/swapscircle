-- Update the handle_new_user trigger to not set default usernames
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Create minimal profile without setting username
    INSERT INTO public.profiles (id, first_name, last_name, created_at, updated_at)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        now(),
        now()
    );
    
    RETURN new;
END;
$function$;