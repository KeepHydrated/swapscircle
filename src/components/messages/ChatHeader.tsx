
import React from 'react';
import { MoreHorizontal, Calendar, Star } from 'lucide-react';
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
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear();
  const rating = 0.0; // TODO: Get from profile when available
  const reviewCount = 0; // TODO: Get from profile when available

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
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{profileName}</h2>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-muted-foreground">{rating.toFixed(1)} ({reviewCount})</span>
              </div>
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{memberSince}</span>
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
