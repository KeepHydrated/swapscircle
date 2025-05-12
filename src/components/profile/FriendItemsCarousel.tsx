
import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');
  const carouselRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleLikeClick = (e: React.MouseEvent, item: MatchItem) => {
    e.stopPropagation(); // Prevent triggering selection when clicking heart
    onLikeItem(item.id);
    
    toast({
      title: item.liked ? "Removed from favorites" : "Added to favorites",
      description: `${item.name} has been ${item.liked ? "removed from" : "added to"} your favorites.`
    });
  };

  const handleItemClick = (itemId: string, itemElement: HTMLElement) => {
    // Calculate if the item is in the left or right half of the screen
    if (itemElement) {
      const rect = itemElement.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const isOnRightSide = (rect.left + rect.width/2) > windowWidth/2;
      setDropdownPosition(isOnRightSide ? 'right' : 'left');
    }
    
    setSelectedItemId(prevId => prevId === itemId ? null : itemId);
  };

  // Close the dropdown when clicking outside of the carousel or details panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedItemId) {
        // Check if the click is outside both the carousel and the details panel
        const isOutsideCarousel = carouselRef.current && !carouselRef.current.contains(event.target as Node);
        const isOutsideDetails = detailsRef.current && !detailsRef.current.contains(event.target as Node);
        
        if (isOutsideCarousel && isOutsideDetails) {
          setSelectedItemId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedItemId]);

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="relative w-full">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div ref={carouselRef}>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem key={item.id} className="basis-full sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                <CarouselItemCard
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onItemClick={handleItemClick}
                  onLikeClick={handleLikeClick}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80" />
        </Carousel>
      </div>

      {/* Item details panel that appears when an item is selected - width of 3 items */}
      {selectedItem && (
        <div ref={detailsRef}>
          <ItemDetailsPopup
            item={selectedItem}
            dropdownPosition={dropdownPosition}
            className="w-[calc(50%-2rem)]" // Width of approximately 3 items
          />
        </div>
      )}
    </div>
  );
};

export default FriendItemsCarousel;
