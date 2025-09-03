
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/message';
import MessageBubble from './MessageBubble';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';

interface MessageListProps {
  messages: ChatMessage[];
  chatName: string;
}

const MessageList = ({ messages, chatName }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    console.log('🚀 MessageList effect triggered for:', chatName, 'messages:', messages.length);

    const scrollToBottom = () => {
      console.log('📱 SCROLL ATTEMPT - Current scrollTop:', container.scrollTop, 'scrollHeight:', container.scrollHeight);
      container.scrollTop = container.scrollHeight;
      console.log('📱 SCROLL RESULT - New scrollTop:', container.scrollTop);
    };

    // Immediate scroll
    scrollToBottom();

    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      console.log('🔄 DOM mutation detected, scrolling...');
      scrollToBottom();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: false
    });

    // Also use setTimeout for mobile/tablet
    if (isMobile || isTablet) {
      console.log('📱 Setting up mobile scroll timeouts...');
      const timeouts = [0, 50, 100, 200, 300, 500, 800];
      timeouts.forEach((delay) => {
        setTimeout(() => {
          console.log(`📱 Timeout scroll attempt after ${delay}ms`);
          scrollToBottom();
        }, delay);
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [messages, chatName, isMobile, isTablet]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto" data-messages-container>
      <div className="flex flex-col gap-4 p-4">
        <p className="text-xs text-center text-gray-500 my-2">Today</p>
        
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            senderName={chatName}
          />
        ))}
        
        <div className="flex justify-end">
          <div className="text-xs text-gray-500 mt-1 mr-2">
            Delivered
          </div>
        </div>
        
        {/* Anchor for auto-scrolling */}
        <div ref={scrollRef} />
      </div>
    </div>
  );
};

export default MessageList;
