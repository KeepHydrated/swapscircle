-- Fix the security issues by setting proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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