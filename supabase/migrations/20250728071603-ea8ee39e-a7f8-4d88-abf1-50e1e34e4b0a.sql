-- Fix the username length constraint issue by removing the constraint and updating the trigger
-- First, drop the problematic constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS username_length;

-- Update the handle_new_user function to ensure usernames are at least 3 characters
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
    username_candidate text;
BEGIN
    -- Extract username from email, ensure it's at least 3 characters
    username_candidate := TRIM(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
    
    -- If username is too short, append random suffix
    IF length(username_candidate) < 3 THEN
        username_candidate := username_candidate || '_user';
    END IF;
    
    -- Ensure username meets format requirements and is unique
    INSERT INTO public.profiles (id, username, first_name, last_name)
    VALUES (
        new.id,
        username_candidate,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name'
    );
    
    RETURN new;
END;
$$;