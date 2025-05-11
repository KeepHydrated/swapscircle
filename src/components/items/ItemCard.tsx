
import React from 'react';
import { Heart, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ItemCardProps {
  id: string;
  name: string;
  image: string;
  isSelected?: boolean;
  isMatch?: boolean;
  liked?: boolean;
  onSelect: (id: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  id, 
  name, 
  image, 
  isSelected, 
  isMatch,
  liked,
  onSelect 
}) => {
  return (
    <div className="flex flex-col">
      <Card 
        className={`overflow-hidden cursor-pointer ${isSelected ? 'ring-2 ring-green-500' : ''}`}
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
          </div>
          
          {isSelected && !isMatch && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="h-5 w-5" />
            </div>
          )}
          
          {isMatch && (
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md">
              <Heart className="h-5 w-5 text-red-500" fill={liked ? "red" : "none"} />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-center">{name}</h3>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemCard;
