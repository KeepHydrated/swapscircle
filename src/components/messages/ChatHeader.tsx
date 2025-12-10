
import React from 'react';
import { MoreHorizontal, Calendar, MapPin } from 'lucide-react';
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
  console.log('ChatHeader DEBUG - activeChat:', activeChat);
  console.log('ChatHeader DEBUG - profile:', profile);
  console.log('ChatHeader DEBUG - otherUserProfile.id:', profile?.id);
  console.log('ChatHeader DEBUG - Link URL will be:', `/other-person-profile?userId=${profile?.id}`);
  
  const profileName = profile?.username || activeChat.name;
  console.log('ChatHeader DEBUG - profileName:', profileName);
  
  const avatarUrl = profile?.avatar_url;
  const location = profile?.location || "2.3 mi away";
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : 2023;

  return (
    <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to={`/other-person-profile?userId=${activeChat.otherUserProfile?.id}`}>
            <Avatar className="h-12 w-12 cursor-pointer">
              <AvatarImage src={avatarUrl} alt={profileName} />
              <AvatarFallback>
                {profileName.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/other-person-profile?userId=${activeChat.otherUserProfile?.id}`} className="hover:underline">
              <h2 className="font-semibold text-lg">{profileName}</h2>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Since {memberSince}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
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
