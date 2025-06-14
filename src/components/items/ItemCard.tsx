
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
  showLikeButton
}) => {
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(id);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Card 
        className={`overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow ${
          isSelected && !isMatch ? 'ring-2 ring-green-500' : ''
        }`}
        onClick={() => onSelect(id)}
      >
        <div className="relative">
          <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage src={image} alt={name} className="object-cover" />
              <AvatarFallback className="rounded-none text-gray-400 text-xs">
                400 × 320
              </AvatarFallback>
            </Avatar>
            {(showLikeButton || isMatch) && (
              <button
                className="absolute top-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 shadow-lg"
                aria-label="Like item"
                onClick={handleHeartClick}
              >
                <Heart 
                  className={`h-5 w-5 ${liked ? "text-red-500" : "text-gray-400"}`}
                  fill={liked ? "red" : "none"}
                />
              </button>
            )}
          </div>
          {isSelected && !isMatch && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="h-5 w-5" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-center truncate" title={name}>
            {name}
          </h3>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemCard;
