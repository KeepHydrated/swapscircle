import { supabase } from '@/integrations/supabase/client';

export interface SupportMessage {
  id: string;
  user_id: string;
  message: string;
  sender_type: 'user' | 'support';
  conversation_id: string;
  created_at: string;
  is_read: boolean;
}

export interface SupportConversation {
  id: string;
  user_id: string;
  status: 'open' | 'closed';
  last_message_at: string;
  created_at: string;
}

export const supportService = {
  // Create or get conversation for user
  async getOrCreateConversation(userId: string): Promise<string> {
    // Check if user already has an open conversation
    const { data: existingConversation } = await supabase
      .from('support_conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'open')
      .single();

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from('support_conversations')
      .insert({
        user_id: userId,
        status: 'open'
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return newConversation.id;
  },

  // Send message
  async sendMessage(conversationId: string, message: string, senderType: 'user' | 'support', userId: string) {
    const { error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        message,
        sender_type: senderType
      });

    if (error) {
      throw error;
    }

    // Update conversation last message timestamp
    await supabase
      .from('support_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
  },

  // Get messages for conversation
  async getMessages(conversationId: string): Promise<SupportMessage[]> {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(msg => ({
      ...msg,
      sender_type: msg.sender_type as 'user' | 'support'
    }));
  },

  // Get all conversations for admin
  async getAllConversations(): Promise<(SupportConversation & { user_name: string; user_email: string; latest_message: string })[]> {
    const { data, error } = await supabase
      .from('support_conversations')
      .select(`
        *,
        profiles(name, username)
      `)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get latest messages for each conversation
    const conversationsWithDetails = await Promise.all(
      (data || []).map(async (conversation) => {
        // Get the latest message for this conversation
        const { data: messages } = await supabase
          .from('support_messages')
          .select('message, created_at')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        const latestMessage = messages?.[0];
        
        return {
          ...conversation,
          status: conversation.status as 'open' | 'closed',
          user_name: (conversation.profiles as any)?.name || (conversation.profiles as any)?.username || 'Unknown User',
          user_email: '', // We'll need to get this differently since auth.users is not directly accessible
          latest_message: latestMessage?.message || 'No messages yet'
        };
      })
    );

    return conversationsWithDetails;
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string) {
    const { error } = await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }
  }
};