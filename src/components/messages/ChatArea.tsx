
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
  
  console.log('🎬 ChatArea RENDER:', { 
    hasActiveChat: !!activeChat, 
    chatId: activeChat?.id, 
    isMobile, 
    isTablet,
    timestamp: new Date().toISOString()
  });
  
  // Force scroll when this component renders with an activeChat on mobile/tablet
  useEffect(() => {
    if (!activeChat) return;
    
    console.log('🚀 ChatArea effect triggered!', { 
      chatId: activeChat.id, 
      isMobile, 
      isTablet, 
      shouldScroll: isMobile || isTablet 
    });
    
    if (isMobile || isTablet) {
      const forceScrollNow = () => {
        console.log('🔍 ChatArea: Looking for message containers...');
        const containers = document.querySelectorAll('[data-messages-container]');
        console.log('📦 ChatArea: Found containers:', containers.length);
        
        containers.forEach((container, index) => {
          if (container instanceof HTMLElement) {
            const beforeScroll = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            container.scrollTop = scrollHeight;
            console.log(`📱 ChatArea Container ${index}: before=${beforeScroll}, height=${scrollHeight}, after=${container.scrollTop}`);
          }
        });
      };
      
      // Very aggressive attempts
      console.log('🚀 ChatArea: Starting aggressive scroll attempts...');
      [0, 10, 50, 100, 200, 300, 500, 800, 1200].forEach((delay) => {
        setTimeout(() => {
          console.log(`⏰ ChatArea scroll attempt after ${delay}ms`);
          forceScrollNow();
        }, delay);
      });
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
