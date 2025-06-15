
import { supabase } from '@/integrations/supabase/client';

export interface TradeConversation {
  id: string;
  requester_id: string;
  owner_id: string;
  requester_item_id: string;
  owner_item_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  requester_item?: any;
  owner_item?: any;
  requester_profile?: any;
  owner_profile?: any;
}

export interface TradeMessage {
  id: string;
  trade_conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_profile?: any;
}

export const fetchUserTradeConversations = async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    const { data: conversations, error } = await supabase
      .from('trade_conversations')
      .select(`
        *,
        requester_item:items!trade_conversations_requester_item_id_fkey(*),
        owner_item:items!trade_conversations_owner_item_id_fkey(*),
        requester_profile:profiles!trade_conversations_requester_id_fkey(*),
        owner_profile:profiles!trade_conversations_owner_id_fkey(*)
      `)
      .or(`requester_id.eq.${session.session.user.id},owner_id.eq.${session.session.user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching trade conversations:', error);
      return [];
    }

    return conversations || [];
  } catch (error) {
    console.error('Error fetching trade conversations:', error);
    return [];
  }
};

export const fetchTradeMessages = async (conversationId: string) => {
  try {
    const { data: messages, error } = await supabase
      .from('trade_messages')
      .select(`
        *,
        sender_profile:profiles!trade_messages_sender_id_fkey(*)
      `)
      .eq('trade_conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching trade messages:', error);
      return [];
    }

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
