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
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onNewMessageRef = useRef(onNewMessage);
  const onConversationUpdateRef = useRef(onConversationUpdate);

  // Update refs when callbacks change
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    onConversationUpdateRef.current = onConversationUpdate;
  }, [onConversationUpdate]);

  useEffect(() => {
    if (!conversationId) {
      console.log('❌ No conversationId provided for real-time subscription');
      return;
    }

    console.log('🎬 useRealtimeSupportMessages effect triggered', {
      conversationId,
      hasOnNewMessage: !!onNewMessage,
      hasOnConversationUpdate: !!onConversationUpdate
    });

    // Clear any pending retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Clean up existing subscription
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing subscription before creating new one');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Setting up real-time subscription for conversation:', conversationId);

    // Create new subscription with better error handling
    console.log('🔄 Creating realtime subscription for conversation:', conversationId);
    
    const channelName = `support_messages_${conversationId}`;
    console.log('📡 Channel name:', channelName);
    
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: conversationId }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        console.log('🚨 REAL-TIME INSERT EVENT TRIGGERED!', {
          event: payload.eventType,
          table: payload.table,
          new: payload.new,
          conversationId,
          timestamp: new Date().toISOString()
        });
        
        const newMessage = payload.new as SupportMessage;
        
        // Verify the message belongs to this conversation
        if (newMessage.conversation_id === conversationId) {
          console.log('🎯 Message belongs to current conversation, calling onNewMessage');
          console.log('🎯 Message details:', newMessage);
          // Add timeout to ensure state update happens
          setTimeout(() => {
            console.log('🎯 About to call onNewMessageRef.current with:', newMessage);
            onNewMessageRef.current(newMessage);
            console.log('🎯 Called onNewMessageRef.current successfully');
          }, 50);
        } else {
          console.warn('⚠️ Message does not belong to current conversation:', {
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
        console.log('✅ Real-time UPDATE received via hook:', {
          event: payload.eventType,
          table: payload.table,
          new: payload.new,
          conversationId
        });
        
        const updatedConversation = payload.new as any;
        if (onConversationUpdateRef.current && updatedConversation.status) {
          console.log('🔄 Calling onConversationUpdate with status:', updatedConversation.status);
          setTimeout(() => {
            onConversationUpdateRef.current(updatedConversation.status);
          }, 50);
        }
      })
      .subscribe((status) => {
        console.log('📡 Real-time subscription status via hook:', status, 'for conversation:', conversationId);
        
        if (status === 'SUBSCRIBED') {
          console.log('🎯 Successfully subscribed to real-time updates!');
          // Clear any pending retries on successful subscription
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error in real-time subscription');
          
          // Only retry if we don't already have a retry pending
          if (!retryTimeoutRef.current) {
            console.log('🔄 Attempting to resubscribe in 3 seconds...');
            
            retryTimeoutRef.current = setTimeout(() => {
              // Only retry if the channel is still the current one
              if (channelRef.current === channel) {
                console.log('♻️ Retrying subscription...');
                channel.subscribe();
              }
              retryTimeoutRef.current = null;
            }, 3000);
          }
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Real-time subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('🔒 Real-time subscription closed');
        }
      });

    channelRef.current = channel;

    return () => {
      // Clear any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      if (channelRef.current) {
        console.log('🧹 Cleaning up real-time subscription for conversation:', conversationId);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]); // Only depend on conversationId, use refs for callbacks

  // Cleanup on unmount
  useEffect(() => {
    console.log('🏗️ useRealtimeSupportMessages hook mounted/unmounted');
    return () => {
      if (channelRef.current) {
        console.log('🧹 Final cleanup of real-time subscription');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);
};