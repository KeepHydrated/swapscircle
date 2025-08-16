import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SupportMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'support';
  created_at: string;
  is_read: boolean;
  conversation_id: string;
}

interface UseRealtimeSupportMessagesProps {
  conversationId: string | null;
  onNewMessage: (message: SupportMessage) => void;
  onConversationUpdate?: (status: 'open' | 'closed') => void;
}

export const useRealtimeSupportMessages = ({
  conversationId,
  onNewMessage,
  onConversationUpdate
}: UseRealtimeSupportMessagesProps) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    console.log('Setting up real-time subscription for conversation:', conversationId);

    // Create new subscription
    const channel = supabase
      .channel(`support_realtime_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        console.log('Real-time message received:', payload);
        const newMessage = payload.new as SupportMessage;
        onNewMessage(newMessage);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_conversations',
        filter: `id=eq.${conversationId}`,
      }, (payload) => {
        console.log('Real-time conversation update:', payload);
        const updatedConversation = payload.new as any;
        if (onConversationUpdate && updatedConversation.status) {
          onConversationUpdate(updatedConversation.status);
        }
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, onNewMessage, onConversationUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);
};