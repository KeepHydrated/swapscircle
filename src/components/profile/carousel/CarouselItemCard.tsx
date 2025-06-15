
import React from 'react';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MatchItem } from '@/types/item';

interface CarouselItemCardProps {
  item: MatchItem;
  isSelected?: boolean;
  onItemClick: () => void;
  onLikeClick: (e: React.MouseEvent, item: MatchItem) => void;
}

const CarouselItemCard: React.FC<CarouselItemCardProps> = ({
  item,
  isSelected,
  onItemClick,
  onLikeClick
}) => {
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeClick(e, item);
  };

  return (
    <div className="flex flex-col">
      <Card 
        className="overflow-hidden cursor-pointer"
        onClick={onItemClick}
      >
        <div className="relative">
          <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage src={item.image} alt={item.name} className="object-cover" />
              <AvatarFallback className="rounded-none text-gray-400 text-xs">
                320 × 240
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div 
            className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-100"
            onClick={handleHeartClick}
          >
            <Heart 
              className={`h-4 w-4 ${item.liked ? "text-red-500" : "text-gray-400"}`} 
              fill={item.liked ? "red" : "none"} 
            />
          </div>
        </div>
        <CardContent className="p-2">
          <h3 className="font-medium text-center truncate text-sm" title={item.name}>{item.name}</h3>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarouselItemCard;
