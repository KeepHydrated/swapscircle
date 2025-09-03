
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

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth', force = false) => {
    console.log('🔽 Attempting scroll to bottom:', { behavior, force, isMobile, isTablet });
    
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const currentScrollTop = container.scrollTop;
      
      console.log('📏 Scroll metrics:', { scrollHeight, clientHeight, currentScrollTop });
      
      // Force scroll to bottom
      container.scrollTop = scrollHeight;
      
      console.log('✅ Scroll completed, new scrollTop:', container.scrollTop);
    }
    
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    console.log('📨 Messages changed, scheduling scroll...', { messagesCount: messages.length });
    
    // Use longer delays for mobile/tablet and force multiple attempts
    const delays = (isMobile || isTablet) ? [100, 300, 600, 1000] : [50, 150];
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        console.log(`🔄 Scroll attempt ${index + 1} after ${delay}ms`);
        scrollToBottom(index === 0 ? 'auto' : 'smooth', true);
      }, delay);
    });
  }, [messages, isMobile, isTablet]);

  // Ensure the entire content is visible on initial render
  useEffect(() => {
    console.log('🎬 Initial render scroll setup');
    
    // More aggressive multiple attempts for mobile/tablet
    const delays = (isMobile || isTablet) ? [200, 500, 800, 1200] : [100, 200];
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        console.log(`🚀 Initial scroll attempt ${index + 1} after ${delay}ms`);
        scrollToBottom('auto', true);
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
