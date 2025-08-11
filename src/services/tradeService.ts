
import { supabase } from '@/integrations/supabase/client';
import { createTradeAcceptedNotification } from '@/services/notificationService';

export interface TradeConversation {
  id: string;
  requester_id: string;
  owner_id: string;
  requester_item_id: string;
  owner_item_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester_accepted?: boolean;
  owner_accepted?: boolean;
  completed_at?: string;
  requester_item?: {
    id: string;
    name: string;
    image_url: string;
    image_urls?: string[];
    category: string;
    condition: string;
    description: string;
    tags: string[];
    price_range_min?: number;
    price_range_max?: number;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  owner_item?: {
    id: string;
    name: string;
    image_url: string;
    image_urls?: string[];
    category: string;
    condition: string;
    description: string;
    tags: string[];
    price_range_min?: number;
    price_range_max?: number;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  requester_profile?: {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    created_at: string;
    updated_at: string;
  };
  owner_profile?: {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    created_at: string;
    updated_at: string;
  };
}

export interface TradeMessage {
  id: string;
  trade_conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_profile?: {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    created_at: string;
    updated_at: string;
  };
}

export const fetchUserTradeConversations = async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    // Get trade conversations with items
    const { data: conversations, error } = await supabase
      .from('trade_conversations')
      .select(`
        *,
        requester_item:items!trade_conversations_requester_item_id_fkey(id, name, image_url, image_urls, category, condition, description, tags, price_range_min, price_range_max, user_id, created_at, updated_at),
        owner_item:items!trade_conversations_owner_item_id_fkey(id, name, image_url, image_urls, category, condition, description, tags, price_range_min, price_range_max, user_id, created_at, updated_at)
      `)
      .or(`requester_id.eq.${session.session.user.id},owner_id.eq.${session.session.user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching trade conversations:', error);
      return [];
    }

    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Get unique user IDs from conversations
    const userIds = [...new Set([
      ...conversations.map(c => c.requester_id),
      ...conversations.map(c => c.owner_id)
    ])];

    // Fetch profiles for all users involved
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email, avatar_url, bio, location, created_at, updated_at')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue without profiles if there's an error
    }

    // Add profile data to conversations
    const conversationsWithProfiles = conversations.map(conversation => {
      const requesterProfile = profiles?.find(p => p.id === conversation.requester_id);
      const ownerProfile = profiles?.find(p => p.id === conversation.owner_id);
      
      return {
        ...conversation,
        requester_profile: requesterProfile,
        owner_profile: ownerProfile
      };
    });

    console.log('Fetched trade conversations:', conversationsWithProfiles);
    console.log('DEBUG - Item price data sample:', conversationsWithProfiles[0] ? {
      requester_item_price: { 
        min: conversationsWithProfiles[0].requester_item?.price_range_min, 
        max: conversationsWithProfiles[0].requester_item?.price_range_max 
      },
      owner_item_price: { 
        min: conversationsWithProfiles[0].owner_item?.price_range_min, 
        max: conversationsWithProfiles[0].owner_item?.price_range_max 
      }
    } : 'No conversations');
    return conversationsWithProfiles || [];
  } catch (error) {
    console.error('Error fetching trade conversations:', error);
    return [];
  }
};

export const fetchTradeMessages = async (conversationId: string) => {
  try {
    // Fetch messages from trade_messages table
    let { data: messages, error } = await supabase
      .from('trade_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching trade messages:', error);
      return [];
    }

    // If we have messages, fetch sender profiles separately
    if (messages && messages.length > 0) {
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url')
        .in('id', senderIds);

      if (!profileError && profiles) {
        // Add profile data to messages
        messages = messages.map(message => ({
          ...message,
          sender_profile: profiles.find(p => p.id === message.sender_id)
        }));
      }
    }

    console.log('Fetched messages:', messages);
    return messages || [];
  } catch (error) {
    console.error('Error fetching trade messages:', error);
    return [];
  }
};

export const sendTradeMessage = async (conversationId: string, message: string, imageUrls: string[] = []) => {
  try {
    console.log('sendTradeMessage called', { conversationId, message, imageUrls });
    
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      console.error('User not authenticated');
      throw new Error('Not authenticated');
    }

    console.log('User authenticated:', session.session.user.id);

    const { data, error } = await supabase
      .from('trade_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.session.user.id,
        message: message,
        image_urls: imageUrls
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    console.log('Message sent successfully:', data);

    // Update conversation timestamp
    await supabase
      .from('trade_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error sending trade message:', error);
    throw error;
  }
};

export const updateTradeAcceptance = async (conversationId: string, userRole: 'requester' | 'owner', accepted: boolean) => {
  try {
    const updateField = userRole === 'requester' ? 'requester_accepted' : 'owner_accepted';
    
    const { data, error } = await supabase
      .from('trade_conversations')
      .update({ 
        [updateField]: accepted,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating trade acceptance:', error);
      throw error;
    }

    // Notify the other party when someone accepts the trade
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      const currentUserId = sessionRes?.session?.user?.id;
      if (accepted && currentUserId && data) {
        const recipientId = currentUserId === data.requester_id ? data.owner_id : data.requester_id;
        await createTradeAcceptedNotification(recipientId, undefined, conversationId);
      }
    } catch (notifyError) {
      console.error('Error sending trade accepted notification:', notifyError);
    }

    return data;
  } catch (error) {
    console.error('Error updating trade acceptance:', error);
    throw error;
  }
};

export const updateTradeStatus = async (conversationId: string, status: 'accepted' | 'rejected' | 'completed') => {
  try {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };

    // Add completed_at timestamp if status is completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('trade_conversations')
      .update(updateData)
      .eq('id', conversationId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating trade status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating trade status:', error);
    throw error;
  }
};

export const rejectTrade = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('trade_conversations')
      .update({ 
        status: 'rejected',
        requester_accepted: false,
        owner_accepted: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select('*')
      .single();

    if (error) {
      console.error('Error rejecting trade:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error rejecting trade:', error);
    throw error;
  }
};

// Create a new trade conversation when items match
export const createTradeConversation = async (
  requesterId: string,
  ownerId: string,
  requesterItemId: string,
  ownerItemId: string
): Promise<TradeConversation | null> => {
  try {
    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('trade_conversations')
      .select('*')
      .or(`and(requester_id.eq.${requesterId},owner_id.eq.${ownerId},requester_item_id.eq.${requesterItemId},owner_item_id.eq.${ownerItemId}),and(requester_id.eq.${ownerId},owner_id.eq.${requesterId},requester_item_id.eq.${ownerItemId},owner_item_id.eq.${requesterItemId})`)
      .maybeSingle();

    if (existingConversation) {
      return existingConversation;
    }

    // Create new trade conversation
    const { data, error } = await supabase
      .from('trade_conversations')
      .insert({
        requester_id: requesterId,
        owner_id: ownerId,
        requester_item_id: requesterItemId,
        owner_item_id: ownerItemId,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating trade conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createTradeConversation:', error);
    return null;
  }
};

// Check for and complete trades where both parties have accepted but status is still pending
export const checkAndCompleteAcceptedTrades = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Find trades where both parties accepted but status is still pending
    const { data: pendingTrades, error } = await supabase
      .from('trade_conversations')
      .select('*')
      .eq('status', 'pending')
      .eq('requester_accepted', true)
      .eq('owner_accepted', true);

    if (error) {
      console.error('Error checking accepted trades:', error);
      return;
    }

    // Complete each trade that should be completed
    for (const trade of pendingTrades || []) {
      await updateTradeStatus(trade.id, 'completed');
      console.log(`Completed trade ${trade.id}`);
    }
    
    return pendingTrades?.length || 0;
  } catch (error) {
    console.error('Error in checkAndCompleteAcceptedTrades:', error);
    return 0;
  }
};
