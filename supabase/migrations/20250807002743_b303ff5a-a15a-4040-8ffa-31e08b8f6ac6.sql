-- Create a security definer function for admin item removal
CREATE OR REPLACE FUNCTION public.admin_remove_item(item_id_param uuid)
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
    updated_at = now()
  WHERE id = item_id_param
  RETURNING json_build_object(
    'id', id,
    'status', status,
    'is_available', is_available
  ) INTO update_result;
  
  -- Return the result
  RETURN update_result;
END;
$$;