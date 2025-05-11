
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/data/conversations';

interface MessageDisplayProps {
  activeChat: Conversation;
}

const MessageDisplay = ({ activeChat }: MessageDisplayProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="flex flex-col items-center my-8 gap-4">
        {activeChat.isNew && (
          <div className="flex flex-col items-center">
            <p className="text-gray-600">You've matched with {activeChat.name}!</p>
            <p className="text-blue-500 font-medium">Start the conversation about this potential exchange</p>
          </div>
        )}
        <p className="text-gray-500">{activeChat.lastMessage}</p>
      </div>
    </ScrollArea>
  );
};

export default MessageDisplay;
