
import React from 'react';
import { MoreHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Conversation } from '@/hooks/useConversations';
import { Link } from 'react-router-dom';

interface ChatHeaderProps {
  activeChat: Conversation;
  showProfileInfo?: boolean;
}

const ChatHeader = ({ activeChat, showProfileInfo = true }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center h-16 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Link to={`/profile-duplicate`}>
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarFallback className="bg-purple-100 text-purple-800">
              {activeChat.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <div className="flex items-center">
            <Link to={`/profile-duplicate`} className="hover:underline">
              <h2 className="font-medium">{activeChat.name}</h2>
            </Link>
            {activeChat.rating && activeChat.rating > 0 && (
              <div className="ml-2 flex text-yellow-400">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i}
                    className="h-4 w-4"
                    fill={i < (activeChat.rating || 0) ? "currentColor" : "none"}
                  />
                ))}
                <span className="ml-1 text-gray-500 text-sm">({42})</span>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <p className="text-sm text-gray-500">
              {activeChat.isNew ? "New match" : activeChat.distance}
            </p>
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
