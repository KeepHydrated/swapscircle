-- Fix the search_path security issues for the new functions
DROP FUNCTION IF EXISTS public.increment_user_strikes(UUID);
DROP FUNCTION IF EXISTS public.send_violation_notification(UUID, TEXT, TEXT, INTEGER);

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.increment_user_strikes(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_strike_count INTEGER;
BEGIN
    -- Increment strike count
    UPDATE profiles 
    SET strikes_count = COALESCE(strikes_count, 0) + 1,
        updated_at = now()
    WHERE id = target_user_id
    RETURNING strikes_count INTO new_strike_count;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    
    RETURN new_strike_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_violation_notification(
    target_user_id UUID,
    item_name TEXT,
    violation_reason TEXT,
    strike_count INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    notification_id UUID;
    notification_message TEXT;
BEGIN
    -- Create appropriate message based on strike count
    notification_message := format(
        'Your item "%s" has been removed for violating our community guidelines: %s. This is strike %s/3.',
        item_name,
        violation_reason,
        strike_count
    );
    
    -- Add warning for high strike count
    IF strike_count >= 3 THEN
        notification_message := notification_message || ' WARNING: Your account is now at risk of suspension due to repeated violations.';
    ELSIF strike_count = 2 THEN
        notification_message := notification_message || ' Please review our community guidelines to avoid account suspension.';
    END IF;
    
    -- Insert notification
    INSERT INTO notifications (
        user_id,
        type,
        message,
        action_taken,
        action_by,
        status
    ) VALUES (
        target_user_id,
        'violation',
        notification_message,
        'item_removed',
        auth.uid(),
        'unread'
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;