-- Update the send_violation_notification function to include item_id as reference_id
CREATE OR REPLACE FUNCTION public.send_violation_notification(
    target_user_id UUID,
    item_id UUID,
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
    
    -- Insert notification with item_id as reference_id
    INSERT INTO notifications (
        user_id,
        type,
        reference_id,
        message,
        action_taken,
        action_by,
        status
    ) VALUES (
        target_user_id,
        'violation',
        item_id,
        notification_message,
        'item_removed',
        auth.uid(),
        'unread'
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;