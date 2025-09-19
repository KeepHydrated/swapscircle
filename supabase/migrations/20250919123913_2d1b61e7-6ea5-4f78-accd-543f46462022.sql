-- Fix security vulnerability in markets and vendors tables
-- Drop dangerous public access policies
DROP POLICY IF EXISTS "Anyone can view markets" ON public.markets;
DROP POLICY IF EXISTS "Anyone can view vendors" ON public.vendors;

-- Create public views that expose only non-sensitive information
-- Drop views if they exist
DROP VIEW IF EXISTS public.public_markets;
DROP VIEW IF EXISTS public.public_vendors;

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

-- Grant appropriate permissions
GRANT SELECT ON public.public_markets TO public;
GRANT SELECT ON public.public_vendors TO public;