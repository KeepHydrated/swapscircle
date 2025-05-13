
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
  
  // Removed click outside handler that was clearing the selection
  // This ensures the selected item stays selected

  return (
    <div className="lg:w-1/2 sticky top-0 pb-6">
      <h2 className="text-2xl font-bold mb-4">My Items</h2>
      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="grid grid-cols-2 gap-4 pr-4" ref={myItemsRef}>
          {items.map((item) => (
            <ItemCard 
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              isSelected={selectedItemId === item.id}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MyItems;
