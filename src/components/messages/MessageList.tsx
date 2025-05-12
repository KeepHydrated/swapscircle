
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/message';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  chatName: string;
}

const MessageList = ({ messages, chatName }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add an effect to ensure scrolling on initial render
  useEffect(() => {
    // Immediate scroll on mount
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }

    // Also try again after a short delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "auto" });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4 pt-1 pb-4">
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
      
      {/* Div that helps auto-scroll to bottom */}
      <div ref={scrollRef} className="h-12" />
    </div>
  );
};

export default MessageList;
