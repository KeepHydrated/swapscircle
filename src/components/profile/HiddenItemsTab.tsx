import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { Item } from '@/types/item';

interface HiddenItemsTabProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onUnhideClick?: (item: Item) => void;
  onDeleteClick?: (item: Item) => void;
}

const HiddenItemsTab: React.FC<HiddenItemsTabProps> = ({ 
  items, 
  onItemClick,
  onUnhideClick,
  onDeleteClick
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">No hidden items</div>
        <div className="text-sm text-gray-400">
          Items you hide will appear here and can be unhidden later.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <Card 
          key={item.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative opacity-60"
          onClick={() => onItemClick && onItemClick(item)}
        >
          <div className="aspect-[4/3] relative overflow-hidden">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
            {/* Action Icons - Top Left */}
            <div className="absolute top-2 left-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-8 w-8 bg-white/90 hover:bg-white" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (onUnhideClick) onUnhideClick(item);
                }}
              >
                <Eye className="h-4 w-4 text-blue-500" />
              </Button>
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-8 w-8 bg-white/90 hover:bg-white" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (onDeleteClick) onDeleteClick(item);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            {/* Hidden badge */}
            <div className="absolute bottom-2 right-2 bg-gray-800/75 text-white text-xs px-2 py-1 rounded">
              Hidden
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-600">{item.name}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default HiddenItemsTab;