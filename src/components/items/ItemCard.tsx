
import React from 'react';
import { Heart, Check } from 'lucide-react';
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
  showLikeButton?: boolean;
  compact?: boolean;
  disableLike?: boolean;
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
  showLikeButton,
  compact = false,
  disableLike = false
}) => {
  const handleHeartClick = (e: React.MouseEvent) => {
    console.log('DEBUG HEART: ========== HEART CLICKED ==========');
    console.log('DEBUG HEART: Heart clicked for item:', id);
    console.log('DEBUG HEART: Current liked status:', liked);
    console.log('DEBUG HEART: onLike function exists:', !!onLike);
    e.stopPropagation();
    if (onLike) {
      console.log('DEBUG HEART: Calling onLike with id:', id);
      onLike(id);
    } else {
      console.log('DEBUG HEART: No onLike function provided!');
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
              <button
                className={`absolute top-1.5 right-1.5 z-10 flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                aria-label="Like item"
                onClick={handleHeartClick}
              >
                <Heart 
                  className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} transition-colors ${liked ? "text-red-500" : "text-gray-400"}`}
                  fill={liked ? "red" : "none"}
                />
              </button>
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
