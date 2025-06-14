
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { MatchItem } from '@/types/item';
import CarouselItemCard from './carousel/CarouselItemCard';
import ItemDetailsModal from './carousel/ItemDetailsModal';

interface FriendItemsCarouselProps {
  items: MatchItem[];
  onLikeItem: (itemId: string) => void;
  title?: string;
}

const FriendItemsCarousel: React.FC<FriendItemsCarouselProps> = ({ 
  items, 
  onLikeItem,
  title = "Your Friend's Items"
}) => {
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);

  const handleItemClick = (item: MatchItem) => {
    console.log("[FriendItemsCarousel] Opening modal for item:", item);
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    console.log("[FriendItemsCarousel] Closing modal");
    setSelectedItem(null);
  };

  const handleLikeClick = (e: React.MouseEvent, item: MatchItem) => {
    e.stopPropagation();
    onLikeItem(item.id);
    
    toast({
      title: item.liked ? "Removed from favorites" : "Added to favorites",
      description: `${item.name} has been ${item.liked ? "removed from" : "added to"} your favorites.`
    });
  };

  const handleModalLikeClick = (item: MatchItem) => {
    console.log("[FriendItemsCarousel] Modal like clicked for:", item);
    onLikeItem(item.id);
    
    // Update the selected item to reflect the new liked status
    setSelectedItem(prev => prev ? { ...prev, liked: !prev.liked } : null);
    
    toast({
      title: item.liked ? "Removed from favorites" : "Added to favorites",
      description: `${item.name} has been ${item.liked ? "removed from" : "added to"} your favorites.`
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      
      <ScrollArea className="flex-grow h-80">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-2">
          {items.map((item) => (
            <CarouselItemCard
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onItemClick={() => handleItemClick(item)}
              onLikeClick={handleLikeClick}
            />
          ))}
        </div>
      </ScrollArea>

      <ItemDetailsModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        onLikeClick={handleModalLikeClick}
      />
    </div>
  );
};

export default FriendItemsCarousel;
