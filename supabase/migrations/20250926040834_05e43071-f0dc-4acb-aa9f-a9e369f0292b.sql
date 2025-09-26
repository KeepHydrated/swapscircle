-- Add country field to profiles table for better geographic analytics
ALTER TABLE public.profiles 
ADD COLUMN country TEXT;

-- Create index for better query performance on country analytics
CREATE INDEX idx_profiles_country ON public.profiles(country);

-- Update the handle_new_user function to capture country information from IP geolocation
-- This would work if you're capturing country during sign-up process
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
    
    -- Create profile with name saved to both username and name fields
    -- Include country if available in metadata
    INSERT INTO public.profiles (id, username, name, first_name, last_name, country, created_at, updated_at)
    VALUES (
        new.id,
        user_name,
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'country', -- Capture country if provided during sign-up
        now(),
        now()
    );
    
    RETURN new;
END;
$function$;