import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'system' | 'message' | 'trade' | 'friend' | 'match';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  actionBy?: string; // Add this field
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: 'comment', // Default to comment type since that's what the DB supports
        message: `${params.title}: ${params.content}`,
        reference_id: params.relatedId || '',
        action_taken: params.type,
        action_by: params.actionBy, // Add this field
        status: 'unread'
      });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// Friend request notifications
export const createFriendRequestNotification = async (recipientId: string, requesterName: string, requesterId?: string) => {
  await createNotification({
    userId: recipientId,
    type: 'friend',
    title: 'New friend request',
    content: `${requesterName} sent you a friend request.`,
    relatedId: recipientId,
    actionBy: requesterId // Add the requester ID
  });
};

export const createFriendRequestAcceptedNotification = async (requesterId: string, accepterName: string) => {
  await createNotification({
    userId: requesterId,
    type: 'friend',
    title: 'Friend request accepted',
    content: `${accepterName} accepted your friend request.`,
    relatedId: requesterId
  });
};

// Match notifications
export const createMatchNotification = async (
  userId: string,
  userItemName: string,
  matchItemName: string,
  matchUserId: string,
  conversationId?: string
) => {
  await createNotification({
    userId: userId,
    type: 'match',
    title: 'New match found!',
    content: `Your ${userItemName} matched with ${matchItemName}.`,
    relatedId: conversationId || ''
  });
};

// Trade notifications
export const createTradeRequestNotification = async (ownerId: string, requesterName: string, itemName: string) => {
  await createNotification({
    userId: ownerId,
    type: 'trade',
    title: 'New trade request',
    content: `${requesterName} wants to trade for your ${itemName}.`,
    relatedId: ownerId
  });
};

// Message notifications
export const createMessageNotification = async (recipientId: string, senderName: string) => {
  await createNotification({
    userId: recipientId,
    type: 'message',
    title: 'New message',
    content: `You received a new message from ${senderName}.`,
    relatedId: recipientId
  });
};

// Trade accepted notification
export const createTradeAcceptedNotification = async (
  recipientId: string,
  accepterName?: string,
  conversationId?: string
) => {
  await createNotification({
    userId: recipientId,
    type: 'trade',
    title: 'Trade accepted',
    content: accepterName
      ? `${accepterName} accepted your trade.`
      : 'The other party accepted your trade.',
    relatedId: conversationId || recipientId,
  });
};
