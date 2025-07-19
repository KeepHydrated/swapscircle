import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'system' | 'message' | 'trade' | 'friend' | 'match';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        content: params.content,
        related_id: params.relatedId,
        is_read: false
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
export const createFriendRequestNotification = async (recipientId: string, requesterName: string) => {
  await createNotification({
    userId: recipientId,
    type: 'friend',
    title: 'New friend request',
    content: `${requesterName} sent you a friend request.`,
    relatedId: recipientId
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
export const createMatchNotification = async (userId: string, userItemName: string, matchItemName: string, matchUserId: string) => {
  await createNotification({
    userId: userId,
    type: 'match',
    title: 'New match found!',
    content: `Your ${userItemName} matched with ${matchItemName}.`,
    relatedId: matchUserId
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