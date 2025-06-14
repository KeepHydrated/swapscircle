
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { MatchItem } from '@/types/item';
import CarouselItemCard from './carousel/CarouselItemCard';
import ItemDetailsPopup from './carousel/ItemDetailsPopup';

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

  const handleLikeClick = (e: React.MouseEvent, item: MatchItem) => {
    e.stopPropagation(); // Prevent triggering selection when clicking heart
    onLikeItem(item.id);
    
    toast({
      title: item.liked ? "Removed from favorites" : "Added to favorites",
      description: `${item.name} has been ${item.liked ? "removed from" : "added to"} your favorites.`
    });
  };

  const handleItemClick = (item: MatchItem) => {
    setSelectedItem(item);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
  };

  const handlePopupLikeClick = (item: MatchItem) => {
    onLikeItem(item.id);
    
    // Update the selected item's liked status in the local state
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem({
        ...selectedItem,
        liked: !selectedItem.liked
      });
    }
    
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

      {/* Item details lightbox popup */}
      {selectedItem && (
        <ItemDetailsPopup
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleClosePopup}
          onLikeClick={handlePopupLikeClick}
        />
      )}
    </div>
  );
};

export default FriendItemsCarousel;
