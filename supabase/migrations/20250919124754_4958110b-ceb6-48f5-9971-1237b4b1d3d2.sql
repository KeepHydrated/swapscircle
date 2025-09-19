-- Clean up duplicate policy on submissions table to ensure no conflicts
-- Remove the redundant policy as we already have a more comprehensive one
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;

-- Verify RLS is enabled on submissions table
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;