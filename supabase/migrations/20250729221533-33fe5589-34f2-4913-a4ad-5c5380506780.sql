-- Add vacation mode fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN vacation_mode boolean DEFAULT false,
ADD COLUMN show_location boolean DEFAULT true;