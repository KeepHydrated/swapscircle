
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

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior });
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Use a longer delay for mobile/tablet to ensure layout is complete
    const delay = (isMobile || isTablet) ? 300 : 100;
    
    const timeoutId = setTimeout(() => {
      scrollToBottom('smooth');
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [messages, isMobile, isTablet]);

  // Ensure the entire content is visible on initial render
  useEffect(() => {
    // Multiple attempts with increasing delays for mobile/tablet
    const delays = (isMobile || isTablet) ? [100, 300, 500] : [50, 100];
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        scrollToBottom(index === 0 ? 'auto' : 'smooth');
      }, delay);
    });
  }, [isMobile, isTablet]);

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
