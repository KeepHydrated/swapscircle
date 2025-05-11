
import React, { useRef, useEffect } from 'react';
import ItemCard from './ItemCard';

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
  
  // Handle click outside to close selected item
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedItemId && myItemsRef.current) {
        // Check if the click is outside the MyItems container
        if (!myItemsRef.current.contains(event.target as Node)) {
          onSelectItem(''); // Clear selection when clicking outside
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedItemId, onSelectItem]);

  return (
    <div className="lg:w-1/2">
      <h2 className="text-2xl font-bold mb-4">My Items</h2>
      <div className="grid grid-cols-2 gap-4" ref={myItemsRef}>
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
    </div>
  );
};

export default MyItems;
