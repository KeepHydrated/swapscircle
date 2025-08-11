
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage } from '@/types/message';

interface MessageBubbleProps {
  message: ChatMessage;
  senderName: string;
}

const MessageBubble = ({ message, senderName }: MessageBubbleProps) => {
  const isUserMessage = message.sender === 'user';

  return (
    <div 
      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-end gap-2 max-w-[70%] ${isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUserMessage && (
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {senderName.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isUserMessage 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}>
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
