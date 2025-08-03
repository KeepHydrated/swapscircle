
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash2, EyeOff, Eye, Send } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => {
        const isHidden = (item as any).is_hidden;
        const isDraft = item.status === 'draft';
        const hasBeenEdited = (item as any).has_been_edited;
        return (
          <Card 
            key={item.id} 
            className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative ${
              isHidden ? 'opacity-60' : ''
            }`}
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
                    if (onEditClick) onEditClick(item);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 bg-white/90 hover:bg-white" 
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
                  className="h-8 w-8 bg-white/90 hover:bg-white" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onDeleteClick) onDeleteClick(item);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              {/* Hide/Unhide Icon - Top Right - Always visible for hidden items */}
              <div className={`absolute top-2 right-2 transition-opacity ${
                isHidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 bg-white/90 hover:bg-white" 
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

              {/* Status badges */}
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

              {/* Publish button for draft items */}
              {isDraft && onPublishClick && (
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className={`h-7 text-xs ${
                      hasBeenEdited 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!hasBeenEdited}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onPublishClick(item);
                    }}
                    title={hasBeenEdited ? "Publish item" : "Edit the item first before publishing"}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Publish
                  </Button>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className={`font-medium ${isHidden ? 'text-gray-500' : 'text-gray-800'}`}>
                {item.name}
              </h3>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ItemsForTradeTab;
