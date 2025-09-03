
import React, { useEffect, useRef } from 'react';
import { ConversationDisplay } from '@/hooks/useTradeConversations';
import ChatHeader from './ChatHeader';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';

interface ChatAreaProps {
  activeChat: ConversationDisplay | undefined;
  onSendFirstMessage?: (conversationId: string) => void;
  onTradeCompleted?: (conversationId: string) => void;
}

const ChatArea = ({ activeChat, onSendFirstMessage, onTradeCompleted }: ChatAreaProps) => {
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  console.log('ChatArea DEBUG - activeChat:', activeChat);
  
  // Force scroll when this component renders with an activeChat on mobile/tablet
  useEffect(() => {
    if (activeChat && (isMobile || isTablet)) {
      console.log('🚀 ChatArea mounted with activeChat on mobile/tablet, forcing scroll...');
      
      const forceScroll = () => {
        // Find any message container and force scroll
        const containers = document.querySelectorAll('[data-messages-container]');
        containers.forEach((container) => {
          if (container instanceof HTMLElement) {
            container.scrollTop = container.scrollHeight;
            console.log('📱 Forced scroll on container:', container.scrollTop, '/', container.scrollHeight);
          }
        });
      };
      
      // Multiple aggressive attempts with different delays
      setTimeout(forceScroll, 0);
      setTimeout(forceScroll, 50);
      setTimeout(forceScroll, 150);
      setTimeout(forceScroll, 300);
      setTimeout(forceScroll, 500);
      setTimeout(forceScroll, 800);
      setTimeout(forceScroll, 1200);
    }
  }, [activeChat?.id, isMobile, isTablet]);
  
  if (!activeChat) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const handleTradeCompleted = () => {
    if (activeChat && onTradeCompleted) {
      onTradeCompleted(activeChat.id);
    }
  };

  return (
    <div ref={chatAreaRef} className="flex flex-col h-full bg-white">
      {/* Fixed header */}
      <ChatHeader activeChat={activeChat} showProfileInfo={true} />
      
      {/* Scrollable message area with reduced height */}
      <div className="flex-1 overflow-hidden">
        <MessageDisplay 
          activeChat={activeChat} 
          onSendFirstMessage={onSendFirstMessage}
        />
      </div>
      
      {/* Fixed input area at the bottom */}
      <div className="flex-shrink-0">
        <MessageInput 
          onMarkCompleted={handleTradeCompleted} 
          conversationId={activeChat.id} 
        />
      </div>
    </div>
  );
};

export default ChatArea;
