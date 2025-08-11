
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { MatchItem } from '@/types/item';
import CarouselItemCard from './carousel/CarouselItemCard';
import ItemDetailsModal from './carousel/ItemDetailsModal';
import { MobileFriendsCarousel } from './MobileFriendsCarousel';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FriendItemsCarouselProps {
  items: MatchItem[];
  onLikeItem: (itemId: string) => void;
  title?: string;
  onReport?: (id: string) => void;
}

const FriendItemsCarousel: React.FC<FriendItemsCarouselProps> = ({ 
  items, 
  onLikeItem,
  title = "Your Friend's Items",
  onReport
}) => {
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const isMobile = useIsMobile();

  const handleItemClick = (item: MatchItem) => {
    console.log("[FriendItemsCarousel] Opening modal for item:", item);
    console.log("[FriendItemsCarousel] Item priceRangeMin:", item.priceRangeMin);
    console.log("[FriendItemsCarousel] Item priceRangeMax:", item.priceRangeMax);
    console.log("[FriendItemsCarousel] Total items:", items.length);
    const index = items.findIndex(i => i.id === item.id);
    console.log("[FriendItemsCarousel] Setting currentIndex to:", index);
    setCurrentIndex(index);
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

  // Convert MatchItem to the format expected by MobileFriendsCarousel
  const friendItems = items.map(item => ({
    id: item.id,
    title: item.name,
    image: item.image,
    description: item.description || '',
    condition: item.condition || '',
    category: item.category || '',
    user: {
      name: item.userProfile?.name || 'Unknown User',
      avatar_url: item.userProfile?.avatar_url,
      id: item.userProfile?.username || item.id // fallback to item id
    }
  }));

  if (isMobile) {
    return (
      <MobileFriendsCarousel
        items={friendItems}
        onLike={onLikeItem}
      />
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="text-center p-4 bg-red-500 text-white font-bold">
        FRIENDS CAROUSEL IS WORKING - YOU SHOULD SEE NAVIGATION ARROWS
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
         onReport={onReport}
       />
    </div>
  );
};

export default FriendItemsCarousel;
