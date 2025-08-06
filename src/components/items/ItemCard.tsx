
import React, { useState } from 'react';
import { Heart, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import MoreActionsMenu from './matches/MatchActionSelector';

// ADD prop showLikeButton to show heart in explore
interface ItemCardProps {
  id: string;
  name: string;
  image: string;
  isSelected?: boolean;
  isMatch?: boolean;
  liked?: boolean;
  onSelect: (id: string) => void;
  onLike?: (id: string, global?: boolean) => void;
  onReject?: (id: string, global?: boolean) => void;
  onReport?: (id: string) => void;
  showLikeButton?: boolean;
  compact?: boolean;
  disableClick?: boolean;
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
  onReport,
  showLikeButton,
  compact = false,
  disableLike = false,
  disableClick = false,
  category,
  tags,
  userProfile
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const handleHeartClick = (e: React.MouseEvent, global?: boolean) => {
    console.log('💖 ItemCard: Heart button clicked!', { id, onLike: !!onLike, global });
    e.stopPropagation();
    if (onLike) {
      console.log('💖 ItemCard: Calling onLike with id:', id, 'global:', global);
      onLike(id, global);
    } else {
      console.log('💖 ItemCard: No onLike handler provided!');
    }
  };

  const handleRejectClick = (e: React.MouseEvent, global?: boolean) => {
    e.stopPropagation();
    if (onReject) {
      onReject(id, global);
    }
  };

  // Wrapper functions for MoreActionsMenu
  const handleLikeAll = (itemId: string) => {
    if (onLike) {
      onLike(itemId, true);
    }
  };

  const handleRejectAll = (itemId: string) => {
    if (onReject) {
      onReject(itemId, true);
    }
  };

  const handleReport = (itemId: string) => {
    if (onReport) {
      onReport(itemId);
    }
  };

  const handleCardClick = () => {
    if (disableClick) {
      console.log('🔍 ItemCard: Click disabled during interaction');
      return;
    }
    console.log('🔍 ItemCard: Card clicked!', { id, name, onSelect: !!onSelect });
    console.log('🔍 ItemCard: Current isSelected state:', isSelected);
    console.log('🔍 ItemCard: Is match card:', isMatch);
    onSelect(id);
  };

  const handleMouseDown = () => {
    console.log('🔍 ItemCard: Mouse down detected!', { id, name });
  };

  const handleMouseUp = () => {
    console.log('🔍 ItemCard: Mouse up detected!', { id, name });
  };

  console.log('🔍 ItemCard: Rendering card', { 
    id, 
    name, 
    isMatch, 
    showLikeButton,
    isSelected: typeof isSelected !== 'undefined' ? isSelected : 'undefined'
  });

  return (
    <div className="flex flex-col w-full">
      <Card 
        className={`overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 ${
          isSelected && !isMatch ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
        }`}
        onClick={handleCardClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ pointerEvents: 'auto', zIndex: 1 }}
      >
        <div className="relative">
          <div className={`${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-gray-100 relative overflow-hidden`}>
            {!imageLoaded && !imageError && (
              <Skeleton className="w-full h-full rounded-none" />
            )}
            <Avatar 
              className={`h-full w-full rounded-none transition-opacity duration-300 ${
                imageLoaded || imageError ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <AvatarImage 
                src={image} 
                alt={name} 
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
              <AvatarFallback className="rounded-none text-gray-400 text-xs font-medium bg-gradient-to-br from-gray-100 to-gray-200">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {(showLikeButton || isMatch) && !disableLike && (
              <>
                {/* Three-dots menu on the left side for match items */}
                {isMatch && (
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <MoreActionsMenu
                      itemId={id}
                      onLikeAll={handleLikeAll}
                      onRejectAll={handleRejectAll}
                      onReport={handleReport}
                      compact={compact}
                    />
                  </div>
                )}
                
                {/* Action buttons on the right side */}
                <div className="absolute top-1.5 right-1.5 z-10">
                  {isMatch ? (
                    <div className="flex gap-1">
                      {/* Simple reject button for current item */}
                      <button
                        className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                        aria-label="Reject item"
                        onClick={(e) => handleRejectClick(e)}
                      >
                        <X className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400 hover:text-red-500 transition-colors`} />
                      </button>
                      
                      {/* Simple like button for current item */}
                      <button
                        className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                        aria-label="Like item"
                        onClick={(e) => handleHeartClick(e)}
                      >
                        <Heart 
                          className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} transition-colors ${liked ? "text-red-500" : "text-gray-400"}`}
                          fill={liked ? "red" : "none"}
                        />
                      </button>
                    </div>
                ) : (
                  /* Fallback to simple buttons for non-match items */
                  <div className="flex gap-1">
                    {/* Reject button (X) - show for matches or when onReject is provided */}
                    {(isMatch || (showLikeButton && onReject)) && onReject && (
                      <button
                        className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                        aria-label="Reject item"
                        onClick={(e) => handleRejectClick(e)}
                      >
                        <X className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400 hover:text-red-500 transition-colors`} />
                      </button>
                    )}
                    
                    {/* Like button (Heart) */}
                    <button
                      className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                      aria-label="Like item"
                      onClick={(e) => handleHeartClick(e)}
                    >
                      <Heart 
                        className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} transition-colors ${liked ? "text-red-500" : "text-gray-400"}`}
                        fill={liked ? "red" : "none"}
                      />
                    </button>
                  </div>
                  )}
                </div>
              </>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemCard;
