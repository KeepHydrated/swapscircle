import React from 'react';
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
  onItemClick,
}) => {
  const isRemoved = (item as any).status === 'removed';
  const imageUrl =
    item.image ||
    (item as any).image_url ||
    ((item as any).image_urls && (item as any).image_urls.length > 0
      ? (item as any).image_urls[0]
      : null);

  return (
    <div
      className={`relative bg-card rounded-xl overflow-hidden shadow-md cursor-pointer group ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onItemClick(item)}
    >
      <div className="aspect-square relative overflow-hidden bg-muted flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className={`w-full h-full object-cover ${isRemoved ? 'grayscale opacity-60' : ''}`}
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        )}
        {isRemoved && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              REMOVED
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className={`font-semibold text-sm truncate ${isRemoved ? 'text-muted-foreground' : ''}`}>
          {item.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {item.priceRangeMin && item.priceRangeMax
              ? `$${item.priceRangeMin} - $${item.priceRangeMax}`
              : item.priceRangeMin
                ? `$${item.priceRangeMin}+`
                : ''}
          </span>
          {item.condition && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
              {item.condition}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileItemCard;
