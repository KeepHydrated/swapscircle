
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/message';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  chatName: string;
}

const MessageList = ({ messages, chatName }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Ensure the entire content is visible on initial render
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
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
