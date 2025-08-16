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
  console.log('🔥 useRealtimeSupportMessages HOOK CALLED!', {
    conversationId,
    hasConversationId: !!conversationId,
    conversationIdType: typeof conversationId
  });
  
  const channelRef = useRef<any>(null);
  const callbacksRef = useRef({ onNewMessage, onConversationUpdate });
  const currentConversationIdRef = useRef<string | null>(null);
  
  // Update callbacks ref without causing re-subscription
  useEffect(() => {
    callbacksRef.current = { onNewMessage, onConversationUpdate };
  }, [onNewMessage, onConversationUpdate]);
  
  useEffect(() => {
    console.log('🚨 useRealtimeSupportMessages useEffect triggered!', {
      conversationId,
      hasConversationId: !!conversationId,
      conversationIdType: typeof conversationId,
      currentSubscription: currentConversationIdRef.current
    });
    
    // If conversation ID hasn't changed, don't recreate subscription
    if (currentConversationIdRef.current === conversationId && channelRef.current) {
      console.log('🎯 Conversation ID unchanged, keeping existing subscription');
      return;
    }
    
    if (!conversationId) {
      console.log('❌ No conversationId provided for real-time subscription');
      // Clean up existing subscription if conversationId becomes null
      if (channelRef.current) {
        console.log('🧹 Cleaning up subscription due to null conversationId');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        currentConversationIdRef.current = null;
      }
      return;
    }

    console.log('🎬 Setting up real-time subscription for:', conversationId);

    // Clean up existing subscription first
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Update the tracked conversation ID
    currentConversationIdRef.current = conversationId;

    const channelName = `support_messages_${conversationId}`;
    console.log('📡 Creating channel with name:', channelName);
    
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_messages'
      }, (payload) => {
        console.log('🚨 ANY REAL-TIME EVENT ON SUPPORT_MESSAGES!', {
          event: payload.eventType,
          table: payload.table,
          new: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString()
        });
        
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as SupportMessage;
          console.log('🎯 New message received:', newMessage);
          console.log('🎯 Current conversation ID:', currentConversationIdRef.current);
          console.log('🎯 Message conversation ID:', newMessage.conversation_id);
          if (newMessage.conversation_id === currentConversationIdRef.current) {
            console.log('🎯 Message belongs to current conversation, calling onNewMessage');
            callbacksRef.current.onNewMessage(newMessage);
          } else {
            console.log('🎯 Message belongs to different conversation:', newMessage.conversation_id);
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public', 
        table: 'support_conversations'
      }, (payload) => {
        console.log('🚨 CONVERSATION UPDATE EVENT:', {
          event: payload.eventType,
          table: payload.table,
          new: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString()
        });
        
        if (payload.new && (payload.new as any).id === currentConversationIdRef.current) {
          console.log('🔄 Conversation status update for current conversation');
          if (callbacksRef.current.onConversationUpdate) {
            callbacksRef.current.onConversationUpdate((payload.new as any).status);
          }
        }
      })
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status, 'for conversation:', currentConversationIdRef.current);
        
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
    
    console.log('✅ Real-time subscription setup complete for:', currentConversationIdRef.current);
  }, [conversationId]); // Only depend on conversationId

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Final cleanup of real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      currentConversationIdRef.current = null;
    };
  }, []);
};