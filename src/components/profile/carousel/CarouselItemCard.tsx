
import React from 'react';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MatchItem } from '@/types/item';

interface CarouselItemCardProps {
  item: MatchItem;
  isSelected: boolean;
  onItemClick: (itemId: string, element: HTMLElement) => void;
  onLikeClick: (e: React.MouseEvent, item: MatchItem) => void;
}

const CarouselItemCard: React.FC<CarouselItemCardProps> = ({ 
  item, 
  isSelected, 
  onItemClick,
  onLikeClick 
}) => {
  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={(e) => onItemClick(item.id, e.currentTarget)}
    >
      <div className="relative">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full aspect-[4/3] object-cover"
        />
        <button 
          className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
          onClick={(e) => onLikeClick(e, item)}
        >
          <Heart 
            className={`h-4 w-4 ${item.liked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
          />
        </button>
      </div>
      <div className="p-2">
        <h3 className="font-medium text-center truncate text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={item.name}>{item.name}</h3>
      </div>
    </Card>
  );
};

export default CarouselItemCard;
