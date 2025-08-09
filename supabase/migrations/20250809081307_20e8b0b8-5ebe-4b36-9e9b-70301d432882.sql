-- Add reported_user_id column to reports table for profile reports
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS reported_user_id UUID;

-- Add comment to clarify usage
COMMENT ON COLUMN public.reports.reported_user_id IS 'ID of the user being reported (for profile reports). NULL for item reports.';