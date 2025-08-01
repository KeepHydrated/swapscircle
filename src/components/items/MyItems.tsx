
import React, { useRef, useEffect } from 'react';
import ItemCard from './ItemCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Item {
  id: string;
  name: string;
  image: string;
  isSelected?: boolean;
  category?: string;
  condition?: string;
  description?: string;
  tags?: string[];
  priceRange?: string;
}

interface MyItemsProps {
  items: Item[];
  selectedItemId: string;
  onSelectItem: (id: string) => void;
}

const MyItems: React.FC<MyItemsProps> = ({ items, selectedItemId, onSelectItem }) => {
  const myItemsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="flex gap-2 min-w-max p-2" ref={myItemsRef}>
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-64">
              <div className="transition-all duration-200 hover:scale-105">
                <ItemCard 
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  isSelected={selectedItemId === item.id}
                  onSelect={onSelectItem}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MyItems;
