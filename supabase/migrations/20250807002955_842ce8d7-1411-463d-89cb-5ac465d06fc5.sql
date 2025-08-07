-- Add a removal_reason column to the items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS removal_reason text,
ADD COLUMN IF NOT EXISTS removed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS removed_by uuid;

-- Update the admin function to accept and store removal reason
CREATE OR REPLACE FUNCTION public.admin_remove_item(item_id_param uuid, reason_param text DEFAULT 'Violates community guidelines')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  is_admin_user boolean;
  update_result json;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = current_user_id 
    AND role = 'admin' 
    AND is_active = true
  ) INTO is_admin_user;
  
  -- Only proceed if user is admin
  IF NOT is_admin_user THEN
    RAISE EXCEPTION 'Only administrators can remove items';
  END IF;
  
  -- Update the item (this will bypass RLS due to SECURITY DEFINER)
  UPDATE items 
  SET 
    status = 'removed',
    is_available = false,
    removal_reason = reason_param,
    removed_at = now(),
    removed_by = current_user_id,
    updated_at = now()
  WHERE id = item_id_param
  RETURNING json_build_object(
    'id', id,
    'status', status,
    'is_available', is_available,
    'removal_reason', removal_reason,
    'removed_at', removed_at
  ) INTO update_result;
  
  -- Return the result
  RETURN update_result;
END;
$$;

-- Update RLS policy to allow users to see their own removed items
DROP POLICY IF EXISTS "Users can view all their own items" ON public.items;

CREATE POLICY "Users can view all their own items including removed" ON public.items
FOR SELECT
USING (auth.uid() = user_id);