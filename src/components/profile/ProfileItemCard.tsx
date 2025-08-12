
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item } from '@/types/item';
import { ImageIcon, AlertCircle } from 'lucide-react';

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
  const isRemoved = (item as any).status === 'removed';
  
  return (
    <div className="flex flex-col">
      <Card 
        className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
          isSelected ? 'ring-2 ring-primary shadow-md' : ''
        } ${isRemoved ? 'bg-red-50/50' : ''}`}
        onClick={() => onItemClick(item)}
      >
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-50 flex items-center justify-center">
          {(() => {
            const imageUrl = item.image || 
                           (item as any).image_url || 
                           ((item as any).image_urls && (item as any).image_urls.length > 0 ? (item as any).image_urls[0] : null);
            
            return imageUrl ? (
              <img 
                src={imageUrl} 
                alt={item.name} 
                className={`w-full h-full object-cover ${isRemoved ? 'opacity-60 grayscale' : ''}`}
              />
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-400" />
            );
          })()}
          {isRemoved && (
            <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
              <div className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                REMOVED
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-medium text-center ${isRemoved ? 'text-red-700' : 'text-gray-800'}`}>
              {item.name}
            </h3>
            {isRemoved && (
              <Badge variant="destructive" className="text-xs">
                Removed
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileItemCard;
