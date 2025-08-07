-- Create the missing friend request notification
INSERT INTO notifications (
  user_id,
  type,
  message,
  action_taken,
  reference_id,
  status
) VALUES (
  'b5fbf0c4-f064-4be4-99cf-4d32a69b22fc',
  'comment',
  'John 2 sent you a friend request.',
  'friend',
  '6ff818b5-8ac2-43ba-978f-bdec1ebe7485',
  'unread'
);