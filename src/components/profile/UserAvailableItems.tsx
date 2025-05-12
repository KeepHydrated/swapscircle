
import React from 'react';
import { MatchItem } from '@/types/item';
import ItemCard from '@/components/items/ItemCard';

interface UserAvailableItemsProps {
  items: MatchItem[];
  onLikeItem: (itemId: string) => void;
  onSelectItem: (itemId: string) => void;
}

const UserAvailableItems: React.FC<UserAvailableItemsProps> = ({ 
  items, 
  onLikeItem, 
  onSelectItem 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <ItemCard
          key={item.id}
          id={item.id}
          name={item.name}
          image={item.image}
          isMatch={true}
          liked={item.liked}
          onSelect={onSelectItem}
          onLike={onLikeItem}
        />
      ))}
    </div>
  );
};

export default UserAvailableItems;
