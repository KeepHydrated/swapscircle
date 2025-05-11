
import React from 'react';
import { MoreHorizontal, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Conversation } from '@/data/conversations';

interface ChatHeaderProps {
  activeChat: Conversation;
  showProfileInfo?: boolean;
}

const ChatHeader = ({ activeChat, showProfileInfo = true }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {showProfileInfo && (
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-purple-100 text-purple-800">
              {activeChat.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <div className="flex items-center">
            <h2 className="font-medium">{activeChat.name}</h2>
            {showProfileInfo && (
              <div className="ml-2 flex text-yellow-400">
                {"★".repeat(activeChat.rating)}
                <span className="ml-1 text-gray-500 text-sm">({42})</span>
              </div>
            )}
          </div>
          {showProfileInfo ? (
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" /> {activeChat.distance}
              {activeChat.isNew && <span className="ml-2">• New match</span>}
            </p>
          ) : (
            activeChat.isNew && <p className="text-sm text-gray-500">New match</p>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatHeader;
