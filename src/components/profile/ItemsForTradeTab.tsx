
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Item } from '@/types/item';

interface ItemsForTradeTabProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

const ItemsForTradeTab: React.FC<ItemsForTradeTabProps> = ({ items, onItemClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <Card 
          key={item.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => onItemClick(item)}
        >
          <div className="aspect-[4/3] relative overflow-hidden">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/80 hover:bg-white">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-800">{item.name}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ItemsForTradeTab;
