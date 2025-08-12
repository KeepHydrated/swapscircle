
import React from 'react';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MatchItem } from '@/types/item';
import MoreActionsMenu from '@/components/items/matches/MatchActionSelector';

interface CarouselItemCardProps {
  item: MatchItem;
  isSelected?: boolean;
  onItemClick: () => void;
  onLikeClick: (e: React.MouseEvent, item: MatchItem) => void;
  onReport?: (id: string) => void;
}

const CarouselItemCard: React.FC<CarouselItemCardProps> = ({
  item,
  isSelected,
  onItemClick,
  onLikeClick,
  onReport
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
              <AvatarImage src={item.image_urls?.[0] || item.image_url || item.image || '/placeholder.svg'} alt={item.name} className="object-cover" />
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

          {onReport && (
            <div className="absolute top-1 right-1">
              <MoreActionsMenu
                itemId={item.id}
                onLikeAll={(id) => onLikeClick({} as React.MouseEvent, item)}
                onRejectAll={() => {}}
                onReport={onReport}
                compact={true}
              />
            </div>
          )}
        </div>
        <CardContent className="p-2">
          <h3 className="font-medium text-center truncate text-sm" title={item.name}>{item.name}</h3>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarouselItemCard;
