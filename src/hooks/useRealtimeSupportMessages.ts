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
  const callbacksRef = useRef({ onNewMessage, onConversationUpdate });
  
  // Update callbacks ref without causing re-subscription
  useEffect(() => {
    callbacksRef.current = { onNewMessage, onConversationUpdate };
  }, [onNewMessage, onConversationUpdate]);
  
  useEffect(() => {
    if (!conversationId) {
      console.log('❌ No conversationId provided for real-time subscription');
      return;
    }

    console.log('🎬 Setting up real-time subscription for:', conversationId);

    // Clean up existing subscription first
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = `support_${Math.random().toString(36).substr(2, 9)}`;
    console.log('📡 Creating channel with name:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages'
      }, (payload) => {
        console.log('🚨 REAL-TIME INSERT EVENT TRIGGERED (ANY MESSAGE)!', {
          event: payload.eventType,
          table: payload.table,
          new: payload.new,
          expectedConversationId: conversationId,
          timestamp: new Date().toISOString()
        });
        
        const newMessage = payload.new as SupportMessage;
        
        if (newMessage.conversation_id === conversationId) {
          console.log('🎯 Message belongs to current conversation, calling onNewMessage');
          console.log('🎯 Message details:', newMessage);
          callbacksRef.current.onNewMessage(newMessage);
        } else {
          console.log('⚠️ Message for different conversation:', {
            messageConversationId: newMessage.conversation_id,
            expectedConversationId: conversationId
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_conversations',
        filter: `id=eq.${conversationId}`,
      }, (payload) => {
        console.log('✅ Real-time conversation UPDATE received:', {
          event: payload.eventType,
          table: payload.table,
          new: payload.new,
          conversationId
        });
        
        const updatedConversation = payload.new as any;
        if (callbacksRef.current.onConversationUpdate && updatedConversation.status) {
          console.log('🔄 Calling onConversationUpdate with status:', updatedConversation.status);
          callbacksRef.current.onConversationUpdate(updatedConversation.status);
        }
      })
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status, 'for conversation:', conversationId);
        
        if (status === 'SUBSCRIBED') {
          console.log('🎯 Successfully subscribed to real-time updates!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error in real-time subscription');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Real-time subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('🔒 Real-time subscription closed');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('🧹 Cleaning up real-time subscription for conversation:', conversationId);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]); // Only depend on conversationId

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log('🧹 Final cleanup of real-time subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);
};