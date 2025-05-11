
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/data/conversations';
import { Link } from 'react-router-dom';

interface ChatHeaderProps {
  activeChat: Conversation;
  showProfileInfo?: boolean;
}

const ChatHeader = ({ activeChat, showProfileInfo = true }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Link to={`/user/${activeChat.id}`}>
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarFallback className="bg-purple-100 text-purple-800">
              {activeChat.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <div className="flex items-center">
            <Link to={`/user/${activeChat.id}`} className="hover:underline">
              <h2 className="font-medium">{activeChat.name}</h2>
            </Link>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-gray-500">
              {activeChat.isNew ? "New match" : activeChat.distance}
            </p>
            {!activeChat.isNew && activeChat.rating > 0 && (
              <div className="ml-2 flex text-yellow-400">
                {"★".repeat(activeChat.rating)}
                <span className="ml-1 text-gray-500 text-sm">({42})</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatHeader;
