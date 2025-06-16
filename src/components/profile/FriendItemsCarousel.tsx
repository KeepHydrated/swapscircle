
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { MatchItem } from '@/types/item';
import CarouselItemCard from './carousel/CarouselItemCard';
import ItemDetailsModal from './carousel/ItemDetailsModal';
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
      />
    </div>
  );
};

export default FriendItemsCarousel;
