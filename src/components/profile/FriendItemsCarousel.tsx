
import React, { useState, useRef } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
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
  const carouselRef = useRef<HTMLDivElement>(null);

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
      <div className="flex-grow overflow-hidden">
        <div ref={carouselRef} className="h-full">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full">
              {items.map((item) => (
                <CarouselItem key={item.id} className="basis-auto min-w-0 shrink-0 pl-4">
                  <div className="w-48 h-full">
                    <CarouselItemCard
                      item={item}
                      isSelected={selectedItem?.id === item.id}
                      onItemClick={() => handleItemClick(item)}
                      onLikeClick={handleLikeClick}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10" />
          </Carousel>
        </div>
      </div>

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
