
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

  const forceScrollToBottom = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      // Set scroll position to maximum
      container.scrollTop = container.scrollHeight;
      console.log('🔄 Forced scroll - scrollTop:', container.scrollTop, 'scrollHeight:', container.scrollHeight);
      
      // For mobile/tablet, also try scrollIntoView on the last message
      if ((isMobile || isTablet) && scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        console.log('📱 Also used scrollIntoView for mobile/tablet');
      }
    }
  };

  // Scroll when component first mounts (becomes visible)
  useEffect(() => {
    console.log('📦 MessageList mounted for chat:', chatName);
    
    // Use intersection observer to detect when component is visible
    if (containerRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('👁️ MessageList is now visible, forcing scroll...');
            // Multiple scroll attempts when component becomes visible
            setTimeout(forceScrollToBottom, 0);
            setTimeout(forceScrollToBottom, 100);
            setTimeout(forceScrollToBottom, 300);
            if (isMobile || isTablet) {
              setTimeout(forceScrollToBottom, 600);
              setTimeout(forceScrollToBottom, 1000);
            }
          }
        });
      });
      
      observer.observe(containerRef.current);
      
      return () => observer.disconnect();
    }
  }, [chatName, isMobile, isTablet]);

  // Also scroll when messages change
  useEffect(() => {
    console.log('📨 Messages changed, count:', messages.length);
    setTimeout(forceScrollToBottom, 0);
    if (isMobile || isTablet) {
      setTimeout(forceScrollToBottom, 100);
      setTimeout(forceScrollToBottom, 300);
    }
  }, [messages, isMobile, isTablet]);

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
