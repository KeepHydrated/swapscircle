-- Fix security vulnerability in markets and vendors tables
-- Drop dangerous public access policies
DROP POLICY IF EXISTS "Anyone can view markets" ON public.markets;
DROP POLICY IF EXISTS "Anyone can view vendors" ON public.vendors;

-- Create secure RLS policies for markets table
-- Only authenticated users can view markets
CREATE POLICY "Authenticated users can view markets" 
ON public.markets 
FOR SELECT 
TO authenticated
USING (true);

-- Create secure RLS policies for vendors table  
-- Only authenticated users can view vendors
CREATE POLICY "Authenticated users can view vendors" 
ON public.vendors 
FOR SELECT 
TO authenticated
USING (true);

-- Create public views that expose only non-sensitive information
-- Public markets view (no contact details)
CREATE VIEW public.public_markets AS
SELECT 
  id,
  name,
  description,
  website,
  address,
  city,
  state,
  zip_code,
  operating_days,
  vendor_count,
  has_parking,
  is_outdoor,
  accepts_credit_cards,
  additional_info,
  created_at,
  updated_at
FROM public.markets;

-- Enable RLS on the public_markets view
ALTER VIEW public.public_markets SET (security_invoker = true);

-- Create policy for public markets view
CREATE POLICY "Anyone can view public market info" 
ON public.public_markets 
FOR SELECT 
TO public
USING (true);

-- Public vendors view (no contact details)
CREATE VIEW public.public_vendors AS
SELECT 
  id,
  name,
  description,
  website,
  market_id,
  specialties,
  products,
  additional_info,
  created_at,
  updated_at
FROM public.vendors;

-- Enable RLS on the public_vendors view
ALTER VIEW public.public_vendors SET (security_invoker = true);

-- Create policy for public vendors view
CREATE POLICY "Anyone can view public vendor info" 
ON public.public_vendors 
FOR SELECT 
TO public
USING (true);

-- Grant appropriate permissions
GRANT SELECT ON public.public_markets TO public;
GRANT SELECT ON public.public_vendors TO public;