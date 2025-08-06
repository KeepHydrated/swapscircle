
import React, { useRef, useEffect } from 'react';
import ItemCard from './ItemCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

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
  loading?: boolean;
}

const MyItems: React.FC<MyItemsProps> = ({ items, selectedItemId, onSelectItem, loading = false }) => {
  const myItemsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full">
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="flex gap-2 min-w-max p-2" ref={myItemsRef}>
          {loading ? (
            // Show skeleton loading states
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex-shrink-0 w-36">
                <Card className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-2">
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                </Card>
              </div>
            ))
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-36">
                <div className="transition-all duration-200">
                  <ItemCard 
                    id={item.id}
                    name={item.name}
                    image={item.image}
                    isSelected={selectedItemId === item.id}
                    onSelect={onSelectItem}
                    compact={true}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyItems;
