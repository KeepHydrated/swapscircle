
import React, { useEffect, useRef } from 'react';
import { ConversationDisplay } from '@/hooks/useTradeConversations';
import { toast } from 'sonner';
import { getMessagesByChatId } from '@/utils/messageData';
import NewMatchPrompt from './NewMatchPrompt';
import MessageList from './MessageList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';

interface MessageDisplayProps {
  activeChat: ConversationDisplay;
  onSendFirstMessage?: (conversationId: string) => void;
}

const MessageDisplay = ({ activeChat, onSendFirstMessage }: MessageDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  // Choose the correct message set based on active chat ID
  const messages = getMessagesByChatId(activeChat.id);
  
  const handleSendFirstMessage = () => {
    if (onSendFirstMessage) {
      onSendFirstMessage(activeChat.id);
      toast(`First message sent to ${activeChat.name}`);
    }
  };

  // Force scroll to bottom when activeChat changes or messages load
  useEffect(() => {
    console.log('🔄 MessageDisplay: Forcing scroll to bottom for chat:', activeChat.id, 'messages:', messages.length);
    
    const scrollToBottom = () => {
      // Find the message container and scroll it
      const messageContainer = document.querySelector('[data-messages-container]') as HTMLElement;
      if (messageContainer) {
        console.log('📦 Found message container, scrolling...', messageContainer.scrollHeight);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        console.log('✅ Scrolled to:', messageContainer.scrollTop, 'of', messageContainer.scrollHeight);
      } else {
        console.log('❌ Message container not found!');
      }
      
      // Also try the container ref
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
        console.log('📦 Also scrolled containerRef');
      }
    };
    
    // Multiple aggressive attempts for mobile/tablet
    const delays = (isMobile || isTablet) ? [0, 100, 300, 600, 1000] : [0, 50, 150];
    console.log('📱 Setting up scroll attempts with delays:', delays, 'isMobile:', isMobile, 'isTablet:', isTablet);
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        console.log(`🔄 Scroll attempt ${index + 1} after ${delay}ms`);
        scrollToBottom();
      }, delay);
    });
  }, [activeChat.id, messages.length, isMobile, isTablet]);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden max-h-[calc(50vh-120px)]">
      {activeChat.isNew ? (
        <NewMatchPrompt 
          name={activeChat.name} 
          onSendFirstMessage={handleSendFirstMessage} 
          conversationId={activeChat.id} 
        />
      ) : (
        <MessageList 
          messages={messages} 
          chatName={activeChat.name} 
        />
      )}
    </div>
  );
};

export default MessageDisplay;
