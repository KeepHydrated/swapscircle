
import { supabase } from '@/integrations/supabase/client';

export interface TradeConversation {
  id: string;
  requester_id: string;
  owner_id: string;
  requester_item_id: string;
  owner_item_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester_item?: {
    id: string;
    name: string;
    image_url: string;
    category: string;
    condition: string;
    description: string;
    tags: string[];
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  owner_item?: {
    id: string;
    name: string;
    image_url: string;
    category: string;
    condition: string;
    description: string;
    tags: string[];
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  requester_profile?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    username: string;
    created_at: string;
    updated_at: string;
  };
  owner_profile?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    username: string;
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
    name: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    username: string;
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
        requester_item:items!trade_conversations_requester_item_id_fkey(*),
        owner_item:items!trade_conversations_owner_item_id_fkey(*)
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

    console.log('User IDs to fetch profiles for:', userIds);

    // Fetch profiles for all users involved
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    console.log('Fetched profiles:', profiles);
    console.log('Profile fetch error:', profilesError);

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
    return conversationsWithProfiles || [];
  } catch (error) {
    console.error('Error fetching trade conversations:', error);
    return [];
  }
};

export const fetchTradeMessages = async (conversationId: string) => {
  try {
    // First try with profile join, if that fails, fetch without profiles
    let { data: messages, error } = await supabase
      .from('trade_messages')
      .select('*')
      .eq('trade_conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching trade messages:', error);
      return [];
    }

    console.log('Fetched messages:', messages);
    return messages || [];
  } catch (error) {
    console.error('Error fetching trade messages:', error);
    return [];
  }
};

export const sendTradeMessage = async (conversationId: string, message: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('trade_messages')
      .insert({
        trade_conversation_id: conversationId,
        sender_id: session.session.user.id,
        message
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

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

export const updateTradeStatus = async (conversationId: string, status: 'accepted' | 'rejected' | 'completed') => {
  try {
    const { data, error } = await supabase
      .from('trade_conversations')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
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
