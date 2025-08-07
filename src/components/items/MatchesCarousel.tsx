import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { MatchItem } from '@/types/item';
import CarouselItemCard from '@/components/profile/carousel/CarouselItemCard';
import ItemDetailsModal from '@/components/profile/carousel/ItemDetailsModal';
import { MobileMatchesView } from './matches/MobileMatchesView';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MatchesCarouselProps {
  items: MatchItem[];
  onLikeItem: (itemId: string) => void;
  onRejectItem: (itemId: string) => void;
  title?: string;
  onReport?: (id: string) => void;
  likedItems?: Record<string, boolean>;
}

const MatchesCarousel: React.FC<MatchesCarouselProps> = ({ 
  items, 
  onLikeItem,
  onRejectItem,
  title = "Matches",
  onReport,
  likedItems = {}
}) => {
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const isMobile = useIsMobile();

  const handleItemClick = (item: MatchItem) => {
    console.log("[MatchesCarousel] Opening modal for item:", item);
    console.log("[MatchesCarousel] Item priceRangeMin:", item.priceRangeMin);
    console.log("[MatchesCarousel] Item priceRangeMax:", item.priceRangeMax);
    console.log("[MatchesCarousel] Total items:", items.length);
    const index = items.findIndex(i => i.id === item.id);
    console.log("[MatchesCarousel] Setting currentIndex to:", index);
    setCurrentIndex(index);
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    console.log("[MatchesCarousel] Closing modal");
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
    console.log("[MatchesCarousel] Modal like clicked for:", item);
    onLikeItem(item.id);
    
    // Update the selected item to reflect the new liked status
    setSelectedItem(prev => prev ? { ...prev, liked: !prev.liked } : null);
    
    toast({
      title: item.liked ? "Removed from favorites" : "Added to favorites",
      description: `${item.name} has been ${item.liked ? "removed from" : "added to"} your favorites.`
    });
  };

  const handleNavigatePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedItem(items[newIndex]);
    }
  };

  const handleNavigateNext = () => {
    if (currentIndex < items.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedItem(items[newIndex]);
    }
  };

  if (isMobile) {
    return (
      <MobileMatchesView
        matches={items}
        likedItems={likedItems}
        onLike={onLikeItem}
        onReject={onRejectItem}
        onReport={onReport || (() => {})}
        onOpenModal={(id: string) => {
          const item = items.find(i => i.id === id);
          if (item) {
            handleItemClick(item);
          }
        }}
      />
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="text-center p-4 bg-blue-500 text-white font-bold">
        MATCHES CAROUSEL IS WORKING - YOU SHOULD SEE NAVIGATION ARROWS
      </div>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      
      <div className="flex-grow">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-auto">
                <div className="w-48">
                  <CarouselItemCard
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onItemClick={() => handleItemClick(item)}
                    onLikeClick={handleLikeClick}
                    onReport={onReport}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      <ItemDetailsModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        onLikeClick={handleModalLikeClick}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        currentIndex={currentIndex}
        totalItems={items.length}
      />
    </div>
  );
};

export default MatchesCarousel;