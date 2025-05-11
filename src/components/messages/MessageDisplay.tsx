
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/data/conversations';

interface MessageDisplayProps {
  activeChat: Conversation;
}

const MessageDisplay = ({ activeChat }: MessageDisplayProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="flex justify-center my-8">
        <p className="text-blue-500">{activeChat.lastMessage}</p>
      </div>
    </ScrollArea>
  );
};

export default MessageDisplay;
