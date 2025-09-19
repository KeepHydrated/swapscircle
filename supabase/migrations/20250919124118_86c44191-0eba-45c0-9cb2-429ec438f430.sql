-- Fix security definer views by setting them to security invoker
-- This ensures RLS policies are enforced for the querying user, not the view creator

-- Fix matches view
ALTER VIEW public.matches SET (security_invoker = true);

-- Fix public_markets view  
ALTER VIEW public.public_markets SET (security_invoker = true);

-- Fix public_profiles view
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Fix public_vendors view
ALTER VIEW public.public_vendors SET (security_invoker = true);