
import { supabase } from '@/integrations/supabase/client';

export interface TradeConversation {
  id: string;
  requester_id: string;
  owner_id: string;
  requester_item_id: string;
  requester_item_ids?: string[] | null;
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
  requester_items?: Array<{
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
  }>;
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

    // Collect all item IDs that need to be fetched for multiple-item trades
    const allItemIds: string[] = [];
    conversations.forEach((c: any) => {
      if (c.requester_item_ids && Array.isArray(c.requester_item_ids)) {
        allItemIds.push(...c.requester_item_ids);
      }
      if (c.owner_item_ids && Array.isArray(c.owner_item_ids)) {
        allItemIds.push(...c.owner_item_ids);
      }
    });

    // Fetch all additional items if there are multiple-item trades
    let additionalItemsMap: Record<string, any> = {};
    if (allItemIds.length > 0) {
      const { data: additionalItems, error: itemsError } = await supabase
        .from('items')
        .select('id, name, image_url, image_urls, category, condition, description, tags, price_range_min, price_range_max, user_id, created_at, updated_at')
        .in('id', [...new Set(allItemIds)]); // Deduplicate IDs
      
      if (!itemsError && additionalItems) {
        additionalItems.forEach(item => {
          additionalItemsMap[item.id] = item;
        });
      }
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

    // Add profile data and items arrays to conversations
    const conversationsWithProfiles = conversations.map((conversation: any) => {
      const requesterProfile = profiles?.find(p => p.id === conversation.requester_id);
      const ownerProfile = profiles?.find(p => p.id === conversation.owner_id);
      
      // Build requester_items array from requester_item_ids
      let requester_items: any[] = [];
      if (conversation.requester_item_ids && Array.isArray(conversation.requester_item_ids)) {
        requester_items = conversation.requester_item_ids
          .map((id: string) => additionalItemsMap[id])
          .filter(Boolean);
      }
      // If no requester_item_ids but has requester_item, use that as the single item
      if (requester_items.length === 0 && conversation.requester_item) {
        requester_items = [conversation.requester_item];
      }
      
      // Build owner_items array from owner_item_ids
      let owner_items: any[] = [];
      if (conversation.owner_item_ids && Array.isArray(conversation.owner_item_ids)) {
        owner_items = conversation.owner_item_ids
          .map((id: string) => additionalItemsMap[id])
          .filter(Boolean);
      }
      // If no owner_item_ids but has owner_item, use that as the single item
      if (owner_items.length === 0 && conversation.owner_item) {
        owner_items = [conversation.owner_item];
      }
      
      return {
        ...conversation,
        requester_profile: requesterProfile,
        owner_profile: ownerProfile,
        requester_items,
        owner_items
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
      },
      requester_items_count: conversationsWithProfiles[0].requester_items?.length
    } : 'No conversations');
    return conversationsWithProfiles || [];
  } catch (error) {
    console.error('Error fetching trade conversations:', error);
    return [];
  }
};

export const fetchTradeMessages = async (conversationId: string) => {
  try {
    // Return test messages for test conversation (only visible to nadiachibri@gmail.com)
    if (conversationId === 'test-conversation-123') {
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user?.email === 'nadiachibri@gmail.com') {
        const testMessages = [
          {
            id: 'test-msg-1',
            conversation_id: 'test-conversation-123',
            sender_id: 'test-user-456',
            message: 'Hey! I saw your vinyl record collection and I\'m really interested. I have a vintage Canon AE-1 camera that might be perfect for a trade.',
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            image_urls: [],
            sender_profile: {
              id: 'test-user-456',
              username: 'alexjohnson',
              name: 'Alex Johnson',
              avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
          },
          {
            id: 'test-msg-2',
            conversation_id: 'test-conversation-123',
            sender_id: 'test-user-456',
            message: 'The camera is in excellent condition and comes with the original case and manual. What do you think?',
            created_at: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
            image_urls: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop'],
            sender_profile: {
              id: 'test-user-456',
              username: 'alexjohnson',
              name: 'Alex Johnson',
              avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
          },
          {
            id: 'test-msg-3',
            conversation_id: 'test-conversation-123',
            sender_id: currentUser.user.id,
            message: 'That looks like an amazing camera! I\'d love to make this trade. The vinyl collection has some rare jazz albums from the 70s.',
            created_at: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
            image_urls: [],
            sender_profile: {
              id: currentUser.user.id,
              username: 'You',
              name: 'You',
              avatar_url: ''
            }
          },
          {
            id: 'test-msg-4',
            conversation_id: 'test-conversation-123',
            sender_id: 'test-user-456',
            message: 'Perfect! Those jazz albums sound incredible. When would be a good time to meet up and make the exchange?',
            created_at: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
            image_urls: [],
            sender_profile: {
              id: 'test-user-456',
              username: 'alexjohnson',
              name: 'Alex Johnson',
              avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
          }
        ];
        return testMessages;
      }
    }
    
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

    // Notify the other party when someone accepts the trade (server-side RPC to bypass RLS)
    try {
      if (accepted && data) {
        const { error: rpcError } = await (supabase as any).rpc('create_trade_accepted_notification', {
          p_conversation_id: conversationId,
          p_message: null
        });
        if (rpcError) throw rpcError;
      }
    } catch (notifyError) {
      console.error('Error sending trade accepted notification via RPC:', notifyError);
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

    if (status === 'completed') {
      try {
        const { error: rpcError2 } = await (supabase as any).rpc('create_trade_completed_notifications', {
          p_conversation_id: conversationId,
          p_message: null
        });
        if (rpcError2) throw rpcError2;
      } catch (notifyErr) {
        console.error('Error sending trade completed notifications via RPC:', notifyErr);
      }
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
    // Prevent trading with yourself
    if (requesterId === ownerId) {
      console.error('Cannot create trade conversation with yourself');
      return null;
    }
    
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
        requester_item_ids: [requesterItemId],
        owner_item_id: ownerItemId,
        owner_item_ids: [ownerItemId],
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

// DEV ONLY: Create a test incoming trade request where current user is the owner
export const createTestIncomingTrade = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('No authenticated user');
      return null;
    }
    
    const currentUserId = session.user.id;
    
    // Get one of the current user's items (they will be the owner)
    const { data: myItems } = await supabase
      .from('items')
      .select('id, name')
      .eq('user_id', currentUserId)
      .eq('is_available', true)
      .limit(1);
    
    if (!myItems || myItems.length === 0) {
      console.error('Current user has no available items');
      return null;
    }
    
    // Get another user's item (they will be the requester)
    const { data: otherItems } = await supabase
      .from('items')
      .select('id, name, user_id')
      .neq('user_id', currentUserId)
      .eq('is_available', true)
      .limit(2);
    
    if (!otherItems || otherItems.length === 0) {
      console.error('No other users have available items');
      return null;
    }
    
    const requesterUserId = otherItems[0].user_id;
    const requesterItemIds = otherItems.map(item => item.id);
    
    // Create trade conversation where current user is OWNER (receiver)
    const { data, error } = await supabase
      .from('trade_conversations')
      .insert({
        requester_id: requesterUserId,
        owner_id: currentUserId,
        requester_item_id: otherItems[0].id,
        owner_item_id: myItems[0].id,
        requester_item_ids: requesterItemIds,
        owner_item_ids: [myItems[0].id],
        status: 'pending',
        requester_accepted: false,
        owner_accepted: false
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating test trade:', error);
      return null;
    }

    // Add initial message
    await supabase.from('trade_messages').insert({
      conversation_id: data.id,
      sender_id: requesterUserId,
      message: "🔄 I'd like to trade with you!"
    });

    console.log('Created test incoming trade:', data);
    return data;
  } catch (error) {
    console.error('Error in createTestIncomingTrade:', error);
    return null;
  }
};
