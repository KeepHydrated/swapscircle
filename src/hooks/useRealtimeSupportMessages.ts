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
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages'
      }, (payload) => {
        console.log('🚨 REAL-TIME MESSAGE RECEIVED!', payload.new);
        
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as SupportMessage;
          
          // Only process messages for the current conversation
          if (newMessage.conversation_id === currentConversationIdRef.current) {
            console.log('✅ MESSAGE MATCHES - CALLING CALLBACK FOR:', newMessage.id);
            callbacksRef.current.onNewMessage(newMessage);
          } else {
            console.log('❌ DIFFERENT CONVERSATION - IGNORING:', {
              messageConversation: newMessage.conversation_id,
              currentConversation: currentConversationIdRef.current
            });
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public', 
        table: 'support_conversations'
      }, (payload) => {
        console.log('🔄 Conversation status update:', {
          status: (payload.new as any)?.status,
          conversationId: (payload.new as any)?.id,
          currentConversation: currentConversationIdRef.current,
          isMatch: (payload.new as any)?.id === currentConversationIdRef.current
        });
        
        if (payload.new && (payload.new as any).id === currentConversationIdRef.current && callbacksRef.current.onConversationUpdate) {
          console.log('✅ UPDATING CONVERSATION STATUS');
          callbacksRef.current.onConversationUpdate((payload.new as any).status);
        }
      })
      .subscribe((status) => {
        console.log('🔔 SUBSCRIPTION STATUS:', {
          status,
          conversationId: currentConversationIdRef.current,
          timestamp: new Date().toISOString()
        });
        
        if (status === 'SUBSCRIBED') {
          console.log('🟢 SUCCESSFULLY SUBSCRIBED TO REAL-TIME!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('🔴 REAL-TIME SUBSCRIPTION ERROR');
        } else if (status === 'TIMED_OUT') {
          console.error('🟡 REAL-TIME SUBSCRIPTION TIMED OUT');
        } else if (status === 'CLOSED') {
          console.log('🔴 REAL-TIME SUBSCRIPTION CLOSED');
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