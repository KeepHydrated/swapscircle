
import React, { useState, useRef } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { toast } from 'sonner';
import { MatchItem } from '@/types/item';
import CarouselItemCard from './carousel/CarouselItemCard';
import ItemDetailsPopup from './carousel/ItemDetailsPopup';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleLikeClick = (e: React.MouseEvent, item: MatchItem) => {
    e.stopPropagation(); // Prevent triggering selection when clicking heart
    
    // Toggle liked state
    onLikeItem(item.id);
    
    // Show toast and navigate to messages if item is now liked
    if (!item.liked) {
      toast(`You matched with ${item.name}! Check your messages.`);
      
      // Navigate to messages with item info after a short delay
      setTimeout(() => {
        navigate('/messages', { 
          state: { 
            likedItem: {
              ...item,
              liked: true  // Ensure the item is marked as liked
            } 
          }
        });
      }, 1000);
    }
  };

  const handleItemClick = (item: MatchItem) => {
    setSelectedItem(item);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
  };

  const handlePopupLikeClick = (item: MatchItem) => {
    // Close the popup
    setSelectedItem(null);
    
    // Toggle liked state for the item
    onLikeItem(item.id);
    
    // Show toast and navigate to messages if item is now liked
    if (!item.liked) {
      toast(`You matched with ${item.name}! Check your messages.`);
      
      // Navigate to messages with item info after a short delay
      setTimeout(() => {
        navigate('/messages', { 
          state: { 
            likedItem: {
              ...item,
              liked: true
            } 
          }
        });
      }, 1000);
    }
  };

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
                  isSelected={selectedItem?.id === item.id}
                  onItemClick={() => handleItemClick(item)}
                  onLikeClick={handleLikeClick}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80" />
        </Carousel>
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
