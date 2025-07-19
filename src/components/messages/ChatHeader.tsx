
import React from 'react';
import { MoreHorizontal, Star, Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConversationDisplay } from '@/hooks/useTradeConversations';
import { Link } from 'react-router-dom';

interface ChatHeaderProps {
  activeChat: ConversationDisplay;
  showProfileInfo?: boolean;
}

const ChatHeader = ({ activeChat, showProfileInfo = true }: ChatHeaderProps) => {
  const profile = activeChat.otherUserProfile;
  const profileName = profile?.name || activeChat.name;
  const avatarUrl = profile?.avatar_url || "/lovable-uploads/6326c61e-753c-4972-9f13-6c9f3b171144.png";
  const location = profile?.location || "2.3 mi away";
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : 2023;

  return (
    <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to={`/other-person-profile`}>
            <Avatar className="h-12 w-12 cursor-pointer">
              <AvatarImage src={avatarUrl} alt={profileName} />
              <AvatarFallback className="bg-purple-100 text-purple-800">
                {profileName.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/other-person-profile`} className="hover:underline">
                <h2 className="font-semibold text-lg">{profileName}</h2>
              </Link>
              <div className="flex items-center text-yellow-400">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i}
                    className="h-4 w-4"
                    fill="currentColor"
                  />
                ))}
                <span className="ml-1 text-gray-600 text-sm font-medium">(42)</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Since {memberSince}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>~1 hour</span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
