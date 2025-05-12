
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
        />
      )}
    </div>
  );
};

export default FriendItemsCarousel;
