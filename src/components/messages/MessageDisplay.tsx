
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/data/conversations';

interface MessageDisplayProps {
  activeChat: Conversation;
}

const MessageDisplay = ({ activeChat }: MessageDisplayProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500">{activeChat.lastMessage}</p>
        <p className="text-sm text-gray-400 mt-2">No message history available</p>
      </div>
    </ScrollArea>
  );
};

export default MessageDisplay;
