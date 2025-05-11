
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/data/conversations';

interface ChatHeaderProps {
  activeChat: Conversation;
}

const ChatHeader = ({ activeChat }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center">
            <h2 className="font-medium">{activeChat.name}</h2>
          </div>
          {activeChat.isNew && <p className="text-sm text-gray-500">New match</p>}
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatHeader;
