-- Update the handle_new_user function to save name to both username and name fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    user_name text;
BEGIN
    -- Extract name from metadata, fall back to email prefix if no name
    user_name := COALESCE(
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'first_name',
        split_part(new.email, '@', 1)
    );
    
    -- Create profile with name saved to both username and name fields
    INSERT INTO public.profiles (id, username, name, first_name, last_name, created_at, updated_at)
    VALUES (
        new.id,
        user_name,
        new.raw_user_meta_data->>'name', -- Save the full name here
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        now(),
        now()
    );
    
    RETURN new;
END;
$$;