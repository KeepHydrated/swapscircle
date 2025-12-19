
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash2, EyeOff, Eye, ImageIcon } from 'lucide-react';
import { Item } from '@/types/item';

interface ItemsForTradeTabProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onEditClick?: (item: Item) => void;
  onCopyClick?: (item: Item) => void;
  onDeleteClick?: (item: Item) => void;
  onHideClick?: (item: Item) => void;
  onPublishClick?: (item: Item) => void;
}

const ItemsForTradeTab: React.FC<ItemsForTradeTabProps> = ({ 
  items, 
  onItemClick,
  onEditClick,
  onCopyClick,
  onDeleteClick,
  onHideClick,
  onPublishClick
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map(item => {
        const isHidden = (item as any).is_hidden;
        const isDraft = item.status === 'draft';
        const isRemoved = item.status === 'removed';
        const imageUrl = item.image || item.image_url || (Array.isArray(item.image_urls) ? item.image_urls[0] : undefined);
        
        return (
          <div 
            key={item.id} 
            className={`relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group ${
              isHidden || isDraft || isRemoved ? 'opacity-60' : ''
            }`}
            onClick={() => onItemClick && onItemClick(item)}
          >
            {/* Image */}
            <div className="aspect-square relative overflow-hidden bg-gray-50 flex items-center justify-center">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={item.name} 
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isRemoved ? 'grayscale' : ''}`}
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
              
              {/* Red overlay for removed items */}
              {isRemoved && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-lg shadow-lg">
                    REMOVED
                  </div>
                </div>
              )}

              {/* Status badges - bottom right of image */}
              <div className="absolute bottom-2 right-2 flex space-x-1">
                {isHidden && (
                  <div className="bg-red-800/75 text-white text-xs px-2 py-1 rounded">
                    Hidden
                  </div>
                )}
                {isDraft && (
                  <div className="bg-yellow-600/75 text-white text-xs px-2 py-1 rounded">
                    Draft
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className={`font-semibold text-sm truncate ${isHidden || isDraft || isRemoved ? 'text-muted-foreground' : ''}`}>
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

            {/* Action buttons - top right */}
            <div className="absolute top-3 right-3 flex gap-1">
              {/* Hide/Unhide Icon - Only show for published items, not removed */}
              {!isDraft && !isRemoved && (
                <div className={`transition-opacity ${
                  isHidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-md" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onHideClick) onHideClick(item);
                    }}
                  >
                    {isHidden ? (
                      <EyeOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-500" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Action buttons - top left */}
            <div className="absolute top-3 left-3 flex gap-1">
              {isRemoved ? (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-md" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onDeleteClick) onDeleteClick(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-md" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onEditClick) onEditClick(item);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-md" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onCopyClick) onCopyClick(item);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-md" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onDeleteClick) onDeleteClick(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItemsForTradeTab;
