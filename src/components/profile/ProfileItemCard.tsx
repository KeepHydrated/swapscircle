
import React from 'react';
import { Card } from '@/components/ui/card';
import { Item } from '@/types/item';

interface ProfileItemCardProps {
  item: Item;
  isSelected: boolean;
  onItemClick: (item: Item) => void;
}

const ProfileItemCard: React.FC<ProfileItemCardProps> = ({ 
  item, 
  isSelected, 
  onItemClick 
}) => {
  return (
    <div className="flex flex-col">
      <Card 
        className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
          isSelected ? 'ring-2 ring-primary shadow-md' : ''
        }`}
        onClick={() => onItemClick(item)}
      >
        <div className="aspect-[4/3] relative overflow-hidden">
          <img 
            src={item.image || (item as any).image_url || '/placeholder.svg'} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-800">{item.name}</h3>
        </div>
      </Card>
    </div>
  );
};

export default ProfileItemCard;
