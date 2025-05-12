
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
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 px-4">
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
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageList;
