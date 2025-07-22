
import React from 'react';
import { Heart, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ADD prop showLikeButton to show heart in explore
interface ItemCardProps {
  id: string;
  name: string;
  image: string;
  isSelected?: boolean;
  isMatch?: boolean;
  liked?: boolean;
  onSelect: (id: string) => void;
  onLike?: (id: string) => void;
  onReject?: (id: string) => void;
  showLikeButton?: boolean;
  compact?: boolean;
  disableLike?: boolean;
  category?: string;
  tags?: string[];
  userProfile?: {
    name: string;
    username?: string;
    avatar_url?: string;
  };
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  id, 
  name, 
  image, 
  isSelected, 
  isMatch,
  liked,
  onSelect,
  onLike,
  onReject,
  showLikeButton,
  compact = false,
  disableLike = false,
  category,
  tags,
  userProfile
}) => {
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(id);
    }
  };

  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReject) {
      onReject(id);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Card 
        className={`overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 ${
          isSelected && !isMatch ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
        }`}
        onClick={() => onSelect(id)}
      >
        <div className="relative">
          <div className={`${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-gray-100 relative overflow-hidden`}>
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage src={image} alt={name} className="object-cover transition-transform duration-300 group-hover:scale-105" />
              <AvatarFallback className="rounded-none text-gray-400 text-xs font-medium bg-gradient-to-br from-gray-100 to-gray-200">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {(showLikeButton || isMatch) && !disableLike && (
              <div className="absolute top-1.5 right-1.5 z-10 flex gap-1">
                {/* Reject button (X) - show for matches or when onReject is provided */}
                {(isMatch || (showLikeButton && onReject)) && onReject && (
                  <button
                    className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                    aria-label="Reject item"
                    onClick={handleRejectClick}
                  >
                    <X className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400 hover:text-red-500 transition-colors`} />
                  </button>
                )}
                
                {/* Like button (Heart) */}
                <button
                  className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                  aria-label="Like item"
                  onClick={handleHeartClick}
                >
                  <Heart 
                    className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} transition-colors ${liked ? "text-red-500" : "text-gray-400"}`}
                    fill={liked ? "red" : "none"}
                  />
                </button>
              </div>
            )}
          </div>
          {isSelected && !isMatch && (
            <div className={`absolute top-1.5 right-1.5 bg-blue-500 text-white rounded-full ${compact ? 'p-1' : 'p-1.5'} shadow-lg`}>
              <Check className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </div>
          )}
        </div>
        <CardContent className={`${compact ? 'p-2' : 'p-3'}`}>
          <h3 className={`font-semibold text-center text-gray-800 ${compact ? 'text-xs' : 'text-sm'} leading-tight truncate`} title={name}>
            {name}
          </h3>
          
          {/* Show category and tags for matches */}
          {isMatch && (category || (tags && tags.length > 0)) && (
            <div className="flex flex-col gap-1 mt-2">
              {category && (
                <span className="text-xs text-gray-600 text-center truncate">
                  {category}
                </span>
              )}
              {tags && tags.length > 0 && (
                <span className="text-xs text-gray-500 text-center truncate">
                  {tags[0]}
                </span>
              )}
            </div>
          )}
          
          {/* Show user profile for matches */}
          {isMatch && userProfile && (
            <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-gray-100">
              {userProfile.avatar_url && (
                <Avatar className="h-4 w-4">
                  <AvatarImage src={userProfile.avatar_url} alt={userProfile.name || userProfile.username} />
                  <AvatarFallback className="text-xs">
                    {(userProfile.name || userProfile.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-xs text-gray-600 truncate">
                {userProfile.username || userProfile.name}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemCard;
